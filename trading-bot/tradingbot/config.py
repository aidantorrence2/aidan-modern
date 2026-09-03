"""Configuration loading with sane defaults. Anything in config.yaml overrides DEFAULTS (deep merge)."""
from __future__ import annotations

import copy
from pathlib import Path

import yaml

DEFAULTS: dict = {
    "universe": [
        {"symbol": "SPY", "allocation": 0.5, "data": {"yahoo": "SPY", "stooq": "spy.us", "alpaca": "SPY", "fred": "SP500"}},
        {"symbol": "QQQ", "allocation": 0.5, "data": {"yahoo": "QQQ", "stooq": "qqq.us", "alpaca": "QQQ", "fred": "NASDAQ100"}},
    ],
    "implied_vol": {"data": {"yahoo": "^VIX", "stooq": "^vix", "fred": "VIXCLS"}, "applies_to": ["SPY", "QQQ"]},
    "cash_rate": {"data": {"fred": "DTB3"}},
    "data": {"sources": ["yahoo", "stooq", "alpaca", "fred", "coinbase"], "cache_dir": "data/cache", "max_age_hours": 12, "csv_dir": None},
    "strategy": {
        "max_weight": 1.0,
        "trend": {"sma_len": 200, "weight": 0.7},
        "mean_reversion": {"rsi_len": 2, "entry": 10, "exit": 65, "exit_sma": 5, "down_days": 3, "regime_len": 200, "bull_weight": 0.3, "bear_weight": 0.0, "max_hold": 10, "exit_on_regime_break": True},
    },
    "risk": {
        "target_vol": 0.12, "vol_lookback": 20, "use_implied_vol": True, "implied_vol_weight": 1.0, "max_scale": 1.0, "min_scale": 0.0,
        "max_asset_weight": 1.0, "max_gross": 1.0, "drawdown_soft": 0.08, "drawdown_hard": 0.15, "soft_scale": 0.5,
        "hard_scale": 0.25, "recover_to": 0.04, "rebalance_band": 0.05, "max_daily_loss_pct": 0.02,
    },
    "backtest": {"initial_cash": 100000, "cost_bps": 5, "execution_lag": 1, "use_drawdown_guard": True, "start": None, "end": None},
    "broker": {"type": "paper", "paper_state": "data/paper_broker.json", "slippage_bps": 3, "alpaca_paper": True},
    "engine": {"state_dir": "data/state"},
}


def _merge(base: dict, override: dict) -> dict:
    out = copy.deepcopy(base)
    for k, v in (override or {}).items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = _merge(out[k], v)
        else:
            out[k] = copy.deepcopy(v)
    return out


def load_config(path: str | Path | None = None) -> dict:
    cfg = copy.deepcopy(DEFAULTS)
    if path and Path(path).exists():
        with open(path) as f:
            user = yaml.safe_load(f) or {}
        # a user-supplied universe replaces the default list wholesale
        cfg = _merge(cfg, user)
        if "universe" in user:
            cfg["universe"] = user["universe"]
    base_dir = Path(path).resolve().parent if path else Path.cwd()
    for key in ("cache_dir", "csv_dir"):
        v = cfg["data"].get(key)
        if v and not Path(v).is_absolute():
            cfg["data"][key] = str(base_dir / v)
    if not Path(cfg["broker"]["paper_state"]).is_absolute():
        cfg["broker"]["paper_state"] = str(base_dir / cfg["broker"]["paper_state"])
    if not Path(cfg["engine"]["state_dir"]).is_absolute():
        cfg["engine"]["state_dir"] = str(base_dir / cfg["engine"]["state_dir"])
    return cfg


def allocations(cfg: dict) -> dict[str, float]:
    return {u["symbol"]: float(u.get("allocation", 0.0)) for u in cfg["universe"]}
