"""Robustness tooling: parameter sensitivity, walk-forward selection, block-bootstrap Monte Carlo.

A strategy that only works at one parameter setting is an artefact of the search, not an edge. The
sensitivity grid shows whether the whole neighbourhood is profitable; walk-forward shows what you
would have earned by re-choosing parameters each year using only past data; the bootstrap turns the
daily return distribution into 'probability of a losing year' style statements.
"""
from __future__ import annotations

import copy
import itertools
from dataclasses import dataclass

import numpy as np
import pandas as pd

from .backtest import BacktestConfig, run_backtest
from .metrics import compute_metrics
from .pipeline import compute_targets
from .risk import RiskConfig
from .strategies import build_ensemble

DEFAULT_GRID = {
    "strategy.trend.sma_len": [150, 200, 250],
    "strategy.mean_reversion.entry": [5, 10, 15],
    "risk.target_vol": [0.10, 0.12, 0.15],
}


def set_path(cfg: dict, dotted: str, value) -> dict:
    out = copy.deepcopy(cfg)
    node = out
    parts = dotted.split(".")
    for p in parts[:-1]:
        node = node[p]
    node[parts[-1]] = value
    return out


def full_backtest(cfg: dict, bars: dict[str, pd.DataFrame], implied_vol, cash_rate, allocations: dict[str, float], bt_overrides: dict | None = None):
    risk = RiskConfig.from_dict(cfg["risk"])
    ens = build_ensemble(cfg["strategy"])
    targets, _ = compute_targets(bars, allocations, ens, risk, implied_vol, set(cfg.get("implied_vol", {}).get("applies_to", []) or []))
    closes = pd.DataFrame({s: b["close"] for s, b in bars.items()})
    bt = BacktestConfig.from_dict({**cfg["backtest"], **(bt_overrides or {})})
    return run_backtest(closes, targets, risk, bt, cash_rate, benchmark_allocations=allocations)


def _rf_daily(cash_rate: pd.Series | None, idx: pd.Index) -> pd.Series | None:
    if cash_rate is None:
        return None
    return cash_rate.reindex(idx).ffill().fillna(0.0) / 100.0 / 252.0


def sensitivity(cfg: dict, bars, implied_vol, cash_rate, allocations, grid: dict | None = None) -> pd.DataFrame:
    grid = grid or DEFAULT_GRID
    keys = list(grid)
    rows = []
    for combo in itertools.product(*[grid[k] for k in keys]):
        c = cfg
        for k, v in zip(keys, combo):
            c = set_path(c, k, v)
        res = full_backtest(c, bars, implied_vol, cash_rate, allocations)
        m = res.metrics
        rows.append({**{k.split(".")[-1]: v for k, v in zip(keys, combo)}, "cagr": m["cagr"], "sharpe": m["sharpe"], "max_dd": m["max_drawdown"], "loss_days": m["loss_day_rate"], "worst_day": m["worst_day"], "calmar": m["calmar"]})
    return pd.DataFrame(rows)


@dataclass
class WalkForwardResult:
    oos_returns: pd.Series
    folds: pd.DataFrame
    metrics: dict


def walk_forward(cfg: dict, bars, implied_vol, cash_rate, allocations, grid: dict | None = None, train_years: int = 4, test_years: int = 1, objective: str = "calmar") -> WalkForwardResult:
    """Re-select the best grid point on each trailing train window, trade it on the next test window.

    Each grid point is backtested once over the full history and sliced per fold; the drawdown guard makes
    the path very mildly state-dependent across slice boundaries, which is immaterial for selection.
    """
    grid = grid or DEFAULT_GRID
    keys = list(grid)
    combos = list(itertools.product(*[grid[k] for k in keys]))
    results = {}
    for combo in combos:
        c = cfg
        for k, v in zip(keys, combo):
            c = set_path(c, k, v)
        results[combo] = full_backtest(c, bars, implied_vol, cash_rate, allocations).returns
    idx = next(iter(results.values())).index
    rf = _rf_daily(cash_rate, idx)
    first_year, last_year = idx[0].year, idx[-1].year
    oos, folds = [], []
    for test_start in range(first_year + train_years, last_year + 1, test_years):
        tr = (idx.year >= test_start - train_years) & (idx.year < test_start)
        te = (idx.year >= test_start) & (idx.year < test_start + test_years)
        if te.sum() < 20:
            continue
        best, best_score = None, -np.inf
        for combo, r in results.items():
            m = compute_metrics(r[tr], rf_daily=rf)
            score = m.get(objective, np.nan)
            if score is not None and not np.isnan(score) and score > best_score:
                best, best_score = combo, score
        r_te = results[best][te]
        oos.append(r_te)
        m_te = compute_metrics(r_te, rf_daily=rf)
        folds.append({"test_year": test_start, **{k.split(".")[-1]: v for k, v in zip(keys, best)}, f"train_{objective}": best_score, "oos_return": m_te["total_return"], "oos_max_dd": m_te["max_drawdown"], "oos_loss_days": m_te["loss_day_rate"]})
    oos_r = pd.concat(oos) if oos else pd.Series(dtype=float)
    return WalkForwardResult(oos_r, pd.DataFrame(folds), compute_metrics(oos_r, rf_daily=rf) if len(oos_r) else {})


def block_bootstrap(returns: pd.Series, n_sims: int = 5000, horizon: int = 252, block: int = 20, seed: int = 7) -> pd.DataFrame:
    """Stationary block bootstrap of daily returns. Returns one row per simulated year."""
    rng = np.random.default_rng(seed)
    r = returns.dropna().to_numpy()
    n = len(r)
    out = np.empty((n_sims, horizon))
    for s in range(n_sims):
        pos = 0
        while pos < horizon:
            start = rng.integers(0, n)
            length = min(rng.geometric(1.0 / block), horizon - pos)
            seg = np.take(r, np.arange(start, start + length) % n)
            out[s, pos:pos + length] = seg
            pos += length
    eq = np.cumprod(1 + out, axis=1)
    peak = np.maximum.accumulate(eq, axis=1)
    mdd = (eq / peak - 1).min(axis=1)
    return pd.DataFrame({"year_return": eq[:, -1] - 1, "max_drawdown": mdd, "loss_days": (out < 0).mean(axis=1)})


def bootstrap_summary(sim: pd.DataFrame) -> dict:
    return {
        "p_losing_year": float((sim["year_return"] < 0).mean()),
        "p_year_below_-5pct": float((sim["year_return"] < -0.05).mean()),
        "p_year_below_-10pct": float((sim["year_return"] < -0.10).mean()),
        "median_year_return": float(sim["year_return"].median()),
        "p5_year_return": float(sim["year_return"].quantile(0.05)),
        "p95_year_return": float(sim["year_return"].quantile(0.95)),
        "p_maxdd_worse_than_10pct": float((sim["max_drawdown"] < -0.10).mean()),
        "p_maxdd_worse_than_20pct": float((sim["max_drawdown"] < -0.20).mean()),
        "median_max_drawdown": float(sim["max_drawdown"].median()),
    }
