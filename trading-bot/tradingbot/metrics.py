"""Performance statistics with an explicit focus on loss-day probability and tail risk."""
from __future__ import annotations

import numpy as np
import pandas as pd

TRADING_DAYS = 252


def _streak(mask: np.ndarray) -> int:
    best = run = 0
    for m in mask:
        run = run + 1 if m else 0
        best = max(best, run)
    return best


def compute_metrics(returns: pd.Series, exposure: pd.Series | None = None, rf_daily: pd.Series | None = None) -> dict:
    r = returns.dropna()
    if r.empty:
        return {}
    equity = (1 + r).cumprod()
    n = len(r)
    years = n / TRADING_DAYS
    total = float(equity.iloc[-1] - 1)
    cagr = float(equity.iloc[-1] ** (1 / years) - 1) if years > 0 else np.nan
    excess = r - (rf_daily.reindex(r.index).fillna(0.0) if rf_daily is not None else 0.0)
    vol = float(r.std(ddof=1) * np.sqrt(TRADING_DAYS))
    sharpe = float(excess.mean() / r.std(ddof=1) * np.sqrt(TRADING_DAYS)) if r.std() > 0 else np.nan
    downside = r[r < 0].std(ddof=1) * np.sqrt(TRADING_DAYS)
    sortino = float(excess.mean() * TRADING_DAYS / downside) if downside > 0 else np.nan
    dd = equity / equity.cummax() - 1
    max_dd = float(dd.min())
    monthly = (1 + r).resample("ME").prod() - 1
    yearly = (1 + r).resample("YE").prod() - 1
    losses = r[r < 0]
    m = {
        "total_return": total,
        "cagr": cagr,
        "ann_vol": vol,
        "sharpe": sharpe,
        "sortino": sortino,
        "max_drawdown": max_dd,
        "calmar": float(cagr / abs(max_dd)) if max_dd < 0 else np.nan,
        "days": n,
        "years": years,
        "loss_day_rate": float((r < 0).mean()),
        "win_day_rate": float((r > 0).mean()),
        "flat_day_rate": float((r == 0).mean()),
        "p_day_below_1pct": float((r < -0.01).mean()),
        "p_day_below_2pct": float((r < -0.02).mean()),
        "worst_day": float(r.min()),
        "best_day": float(r.max()),
        "avg_loss_day": float(losses.mean()) if len(losses) else 0.0,
        "avg_win_day": float(r[r > 0].mean()) if (r > 0).any() else 0.0,
        "cvar_5pct": float(r[r <= r.quantile(0.05)].mean()),
        "longest_loss_streak": int(_streak((r < 0).to_numpy())),
        "monthly_win_rate": float((monthly > 0).mean()),
        "worst_month": float(monthly.min()),
        "yearly_win_rate": float((yearly > 0).mean()),
        "worst_year": float(yearly.min()),
    }
    if exposure is not None:
        e = exposure.reindex(r.index).fillna(0.0)
        m["avg_exposure"] = float(e.mean())
        m["time_in_market"] = float((e > 0.01).mean())
        exposed = r[e.shift(0) > 0.01]
        m["loss_day_rate_when_exposed"] = float((exposed < 0).mean()) if len(exposed) else np.nan
    return m


def yearly_table(returns: pd.Series, benchmark: pd.Series | None = None) -> pd.DataFrame:
    def yr(s: pd.Series) -> pd.Series:
        return ((1 + s.dropna()).resample("YE").prod() - 1).rename(lambda t: t.year)

    cols = {"strategy": yr(returns)}
    if benchmark is not None:
        cols["buy_and_hold"] = yr(benchmark.reindex(returns.index).fillna(0.0))
    return pd.DataFrame(cols)


def format_metrics(m: dict) -> str:
    pct = {
        "total_return", "cagr", "ann_vol", "max_drawdown", "loss_day_rate", "win_day_rate", "flat_day_rate",
        "p_day_below_1pct", "p_day_below_2pct", "worst_day", "best_day", "avg_loss_day", "avg_win_day", "cvar_5pct",
        "monthly_win_rate", "worst_month", "yearly_win_rate", "worst_year", "avg_exposure", "time_in_market",
        "loss_day_rate_when_exposed",
    }
    lines = []
    for k, v in m.items():
        if isinstance(v, float) and k in pct:
            lines.append(f"{k:28s} {v*100:8.2f}%")
        elif isinstance(v, float):
            lines.append(f"{k:28s} {v:8.2f}")
        else:
            lines.append(f"{k:28s} {v}")
    return "\n".join(lines)


def compare(strategy: dict, benchmark: dict, keys: list[str] | None = None) -> pd.DataFrame:
    keys = keys or [
        "cagr", "ann_vol", "sharpe", "sortino", "max_drawdown", "calmar", "loss_day_rate", "p_day_below_1pct",
        "p_day_below_2pct", "worst_day", "cvar_5pct", "longest_loss_streak", "monthly_win_rate", "worst_month",
        "yearly_win_rate", "worst_year", "time_in_market",
    ]
    return pd.DataFrame({"strategy": {k: strategy.get(k) for k in keys}, "buy_and_hold": {k: benchmark.get(k) for k in keys}})
