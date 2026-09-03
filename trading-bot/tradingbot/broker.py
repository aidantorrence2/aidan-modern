"""Broker adapters. PaperBroker keeps a JSON ledger on disk; AlpacaBroker talks to Alpaca's REST API
(paper or live, chosen by ALPACA_PAPER / config). Both expose the same tiny interface the engine needs."""
from __future__ import annotations

import json
import os
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

import requests


@dataclass
class Position:
    symbol: str
    qty: float
    market_value: float
    avg_price: float


class Broker(ABC):
    name = "base"

    @abstractmethod
    def account(self) -> dict: ...  # {"equity": float, "cash": float}

    @abstractmethod
    def positions(self) -> dict[str, Position]: ...

    @abstractmethod
    def last_price(self, symbol: str) -> float: ...

    @abstractmethod
    def submit_market_order(self, symbol: str, notional: float, side: str) -> dict: ...

    @abstractmethod
    def close_position(self, symbol: str) -> dict: ...

    def close_all(self) -> list[dict]:
        return [self.close_position(s) for s in list(self.positions())]

    def is_market_open(self) -> bool:
        return True


class PaperBroker(Broker):
    """Local simulator: fills instantly at the latest close +/- slippage. State survives restarts."""

    name = "paper"

    def __init__(self, state_path: str | Path, price_lookup: Callable[[str], float], initial_cash: float = 100_000.0, slippage_bps: float = 3.0):
        self.path = Path(state_path)
        self.price_lookup = price_lookup
        self.slippage = slippage_bps / 1e4
        if self.path.exists():
            self.state = json.loads(self.path.read_text())
        else:
            self.state = {"cash": initial_cash, "positions": {}, "ledger": []}
            self._save()

    def _save(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(self.state, indent=2, default=str))

    def last_price(self, symbol: str) -> float:
        return float(self.price_lookup(symbol))

    def account(self) -> dict:
        mv = sum(p["qty"] * self.last_price(s) for s, p in self.state["positions"].items())
        return {"equity": self.state["cash"] + mv, "cash": self.state["cash"]}

    def positions(self) -> dict[str, Position]:
        out = {}
        for s, p in self.state["positions"].items():
            if abs(p["qty"]) > 1e-9:
                px = self.last_price(s)
                out[s] = Position(s, p["qty"], p["qty"] * px, p["avg_price"])
        return out

    def submit_market_order(self, symbol: str, notional: float, side: str) -> dict:
        px = self.last_price(symbol) * (1 + self.slippage if side == "buy" else 1 - self.slippage)
        qty = notional / px
        pos = self.state["positions"].setdefault(symbol, {"qty": 0.0, "avg_price": px})
        if side == "buy":
            new_qty = pos["qty"] + qty
            pos["avg_price"] = (pos["avg_price"] * pos["qty"] + px * qty) / new_qty if new_qty else px
            pos["qty"] = new_qty
            self.state["cash"] -= notional
        else:
            qty = min(qty, pos["qty"])
            pos["qty"] -= qty
            self.state["cash"] += qty * px
        fill = {"ts": datetime.now(timezone.utc).isoformat(), "symbol": symbol, "side": side, "qty": qty, "price": px, "notional": qty * px, "status": "filled"}
        self.state["ledger"].append(fill)
        self._save()
        return fill

    def close_position(self, symbol: str) -> dict:
        pos = self.state["positions"].get(symbol)
        if not pos or pos["qty"] <= 0:
            return {"symbol": symbol, "status": "no_position"}
        return self.submit_market_order(symbol, pos["qty"] * self.last_price(symbol), "sell")


class AlpacaBroker(Broker):
    """Alpaca Trading API v2. Notional (dollar) market orders, fractional shares, crypto as BTC/USD."""

    name = "alpaca"

    def __init__(self, key: str | None = None, secret: str | None = None, paper: bool | None = None):
        self.key = key or os.environ.get("ALPACA_API_KEY", "")
        self.secret = secret or os.environ.get("ALPACA_SECRET_KEY", "")
        if paper is None:
            paper = os.environ.get("ALPACA_PAPER", "true").lower() != "false"
        if not self.key or not self.secret:
            raise RuntimeError("set ALPACA_API_KEY and ALPACA_SECRET_KEY")
        self.base = "https://paper-api.alpaca.markets" if paper else "https://api.alpaca.markets"
        self.paper = paper
        self.s = requests.Session()
        self.s.headers.update({"APCA-API-KEY-ID": self.key, "APCA-API-SECRET-KEY": self.secret})

    def _req(self, method: str, path: str, **kw) -> dict | list:
        r = self.s.request(method, self.base + path, timeout=30, **kw)
        if r.status_code >= 400:
            raise RuntimeError(f"alpaca {method} {path} -> {r.status_code}: {r.text[:300]}")
        return r.json() if r.text else {}

    def account(self) -> dict:
        a = self._req("GET", "/v2/account")
        return {"equity": float(a["equity"]), "cash": float(a["cash"]), "status": a.get("status"), "last_equity": float(a.get("last_equity", a["equity"]))}

    def positions(self) -> dict[str, Position]:
        out = {}
        for p in self._req("GET", "/v2/positions"):
            sym = p["symbol"]
            if "/" not in sym and sym.endswith("USD") and p.get("asset_class") == "crypto":
                sym = sym[:-3] + "/USD"
            out[sym] = Position(sym, float(p["qty"]), float(p["market_value"]), float(p["avg_entry_price"]))
        return out

    def last_price(self, symbol: str) -> float:
        if "/" in symbol:
            js = self._req("GET", "/v1beta3/crypto/us/latest/trades", params={"symbols": symbol})
            return float(js["trades"][symbol]["p"])
        r = self.s.get(f"https://data.alpaca.markets/v2/stocks/{symbol}/trades/latest", params={"feed": "iex"}, timeout=30)
        r.raise_for_status()
        return float(r.json()["trade"]["p"])

    def is_market_open(self) -> bool:
        return bool(self._req("GET", "/v2/clock").get("is_open"))

    def submit_market_order(self, symbol: str, notional: float, side: str) -> dict:
        body = {"symbol": symbol, "notional": f"{abs(notional):.2f}", "side": side, "type": "market", "time_in_force": "gtc" if "/" in symbol else "day"}
        return self._req("POST", "/v2/orders", json=body)

    def close_position(self, symbol: str) -> dict:
        return self._req("DELETE", f"/v2/positions/{symbol.replace('/', '')}")


def build_broker(cfg: dict, price_lookup: Callable[[str], float]) -> Broker:
    b = cfg["broker"]
    if b["type"] == "alpaca":
        return AlpacaBroker(paper=bool(b.get("alpaca_paper", True)))
    return PaperBroker(b["paper_state"], price_lookup, initial_cash=float(cfg["backtest"]["initial_cash"]), slippage_bps=float(b.get("slippage_bps", 3)))
