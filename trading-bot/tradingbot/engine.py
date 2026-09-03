"""Live/paper execution loop. Run once per day shortly before the close (e.g. 15:50 ET via cron).

Safety ladder, checked in this order on every run:
1. Daily kill switch: equity below start-of-day equity * (1 - max_daily_loss_pct) -> flatten, halt today.
2. Halted-today flag: never re-enter after a kill switch fired.
3. Drawdown guard (persisted peak equity) scales targets exactly as in the backtest.
4. Gross/asset caps and the rebalance band, then orders. dry_run=True prints instead of sending.
"""
from __future__ import annotations

import json
import logging
from datetime import date, datetime, timezone
from pathlib import Path

import pandas as pd

from .broker import Broker
from .config import allocations as cfg_allocations
from .data import DataHub
from .pipeline import compute_targets
from .risk import DrawdownGuard, RiskConfig, cap_gross
from .strategies import build_ensemble

log = logging.getLogger(__name__)


class Engine:
    def __init__(self, cfg: dict, hub: DataHub, broker: Broker | None = None):
        self.cfg = cfg
        self.hub = hub
        self.broker = broker
        self.risk = RiskConfig.from_dict(cfg["risk"])
        self.ensemble = build_ensemble(cfg["strategy"])
        self.allocs = cfg_allocations(cfg)
        self.state_dir = Path(cfg["engine"]["state_dir"])
        self.state_dir.mkdir(parents=True, exist_ok=True)
        self.state_path = self.state_dir / "engine_state.json"
        self.state = json.loads(self.state_path.read_text()) if self.state_path.exists() else {}

    # ---- data -------------------------------------------------------------------------------
    def load_market_data(self, start: datetime | None = None, force_refresh: bool = False):
        bars = {u["symbol"]: self.hub.get(u["data"], u["symbol"], start=start, force_refresh=force_refresh) for u in self.cfg["universe"]}
        iv_cfg = self.cfg.get("implied_vol") or {}
        implied = None
        if iv_cfg.get("data"):
            try:
                implied = self.hub.get(iv_cfg["data"], "implied_vol", start=start, force_refresh=force_refresh)["close"]
            except Exception as e:  # noqa: BLE001
                log.warning("implied vol unavailable (%s); using realized vol only", e)
        cash_rate = None
        cr_cfg = self.cfg.get("cash_rate") or {}
        if cr_cfg.get("data"):
            try:
                cash_rate = self.hub.get(cr_cfg["data"], "cash_rate", start=start, force_refresh=force_refresh)["close"]
            except Exception as e:  # noqa: BLE001
                log.warning("cash rate unavailable (%s); assuming 0%%", e)
        return bars, implied, cash_rate

    def targets(self, bars, implied) -> tuple[dict[str, float], pd.DataFrame]:
        applies = set((self.cfg.get("implied_vol") or {}).get("applies_to") or [])
        t, diags = compute_targets(bars, self.allocs, self.ensemble, self.risk, implied, applies or None)
        latest = {s: float(t[s].dropna().iloc[-1]) if t[s].notna().any() else 0.0 for s in t}
        rows = []
        for s, d in diags.items():
            last = d.dropna(subset=["close"]).iloc[-1]
            rows.append({"symbol": s, "as_of": d.index[-1].date(), **{k: round(float(last[k]), 4) for k in d.columns}})
        return latest, pd.DataFrame(rows).set_index("symbol")

    # ---- state ------------------------------------------------------------------------------
    def _save(self):
        self.state_path.write_text(json.dumps(self.state, indent=2, default=str))

    def _log(self, record: dict):
        with open(self.state_dir / "activity.jsonl", "a") as f:
            f.write(json.dumps({"ts": datetime.now(timezone.utc).isoformat(), **record}, default=str) + "\n")

    # ---- main loop --------------------------------------------------------------------------
    def run_once(self, dry_run: bool = True, force_refresh: bool = True) -> dict:
        assert self.broker is not None, "engine needs a broker to run"
        today = date.today().isoformat()
        acct = self.broker.account()
        equity = acct["equity"]
        day = self.state.get("day")
        if day != today:
            self.state.update({"day": today, "start_equity": equity, "halted": False})
        self.state["peak_equity"] = max(self.state.get("peak_equity", equity), equity)
        report = {"date": today, "equity": equity, "cash": acct["cash"], "dry_run": dry_run, "orders": []}

        # 1 + 2: kill switch
        loss = equity / self.state["start_equity"] - 1.0
        if loss <= -self.risk.max_daily_loss_pct and not self.state.get("halted"):
            log.error("KILL SWITCH: equity down %.2f%% today; flattening and halting", loss * 100)
            if not dry_run:
                self.broker.close_all()
            self.state["halted"] = True
            self._save()
            report.update({"action": "kill_switch", "daily_pnl": loss})
            self._log(report)
            return report
        if self.state.get("halted"):
            report["action"] = "halted_today"
            self._log(report)
            return report

        # 3: signals + drawdown guard
        bars, implied, _ = self.load_market_data(force_refresh=force_refresh)
        raw_targets, diag = self.targets(bars, implied)
        guard = DrawdownGuard(self.risk)
        guard.peak = self.state["peak_equity"]
        guard.level = int(self.state.get("guard_level", 0))
        dd_scale = guard.update(equity)
        self.state["guard_level"] = guard.level
        desired = cap_gross({s: w * dd_scale for s, w in raw_targets.items()}, self.risk)
        report.update({"raw_targets": raw_targets, "dd_scale": dd_scale, "targets": desired, "diagnostics": diag.to_dict("index")})

        # 4: orders
        positions = self.broker.positions()
        for sym, w in desired.items():
            current = positions.get(sym).market_value if sym in positions else 0.0
            delta = w * equity - current
            full_exit = w == 0.0 and current > 0
            if abs(delta) <= self.risk.rebalance_band * equity and not full_exit:
                continue
            order = {"symbol": sym, "side": "buy" if delta > 0 else "sell", "notional": round(abs(delta), 2), "target_weight": w}
            if not dry_run:
                try:
                    order["result"] = self.broker.close_position(sym) if full_exit else self.broker.submit_market_order(sym, abs(delta), order["side"])
                except Exception as e:  # noqa: BLE001
                    order["error"] = str(e)
                    log.error("order failed for %s: %s", sym, e)
            report["orders"].append(order)
        for sym in positions:
            if sym not in desired and not dry_run:
                report["orders"].append({"symbol": sym, "side": "sell", "note": "not in universe", "result": self.broker.close_position(sym)})
        report["action"] = "rebalanced" if report["orders"] else "no_change"
        self._save()
        self._log({k: v for k, v in report.items() if k != "diagnostics"})
        return report
