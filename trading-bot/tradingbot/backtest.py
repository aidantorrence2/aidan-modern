"""Sequential daily backtester. Deliberately simple and conservative:

* Signals from close t are executed at close t + execution_lag (default 1 day, i.e. no
  "trade on the same close you computed the signal from" optimism).
* Every fill pays cost_bps of notional (spread + slippage + commission bundled).
* Cash earns the T-bill rate when a series is supplied, because being flat is a position.
* Rebalances only when the target differs from the holding by more than rebalance_band of equity
  (full exits always execute) to keep turnover honest.
"""
from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np
import pandas as pd

from .metrics import compute_metrics
from .risk import DrawdownGuard, RiskConfig, cap_gross


@dataclass
class BacktestConfig:
    initial_cash: float = 100_000.0
    cost_bps: float = 5.0
    execution_lag: int = 1
    use_drawdown_guard: bool = True
    start: str | None = None
    end: str | None = None

    @classmethod
    def from_dict(cls, d: dict | None) -> "BacktestConfig":
        d = d or {}
        return cls(**{k: v for k, v in d.items() if k in cls.__dataclass_fields__})


@dataclass
class BacktestResult:
    equity: pd.Series
    returns: pd.Series
    weights: pd.DataFrame
    trades: pd.DataFrame
    benchmark_returns: pd.Series
    costs_paid: float
    turnover: float
    metrics: dict = field(default_factory=dict)
    benchmark_metrics: dict = field(default_factory=dict)


def run_backtest(
    closes: pd.DataFrame,
    targets: pd.DataFrame,
    risk: RiskConfig,
    cfg: BacktestConfig,
    cash_rate: pd.Series | None = None,
    benchmark_allocations: dict[str, float] | None = None,
) -> BacktestResult:
    """closes/targets: DataFrames indexed by date with one column per symbol."""
    idx = closes.index
    if cfg.start:
        idx = idx[idx >= pd.Timestamp(cfg.start)]
    if cfg.end:
        idx = idx[idx <= pd.Timestamp(cfg.end)]
    px = closes.reindex(closes.index).ffill()
    tgt = targets.reindex(closes.index).ffill().fillna(0.0).shift(cfg.execution_lag).fillna(0.0)
    px, tgt = px.loc[idx], tgt.loc[idx]
    syms = list(px.columns)
    rate = (cash_rate.reindex(closes.index).ffill().reindex(idx).fillna(0.0) / 100.0) if cash_rate is not None else pd.Series(0.0, index=idx)

    cash = cfg.initial_cash
    shares = np.zeros(len(syms))
    guard = DrawdownGuard(risk)
    equity_hist = np.zeros(len(idx))
    weight_hist = np.zeros((len(idx), len(syms)))
    trades, costs_paid, notional_traded = [], 0.0, 0.0
    px_np, tgt_np, rate_np = px.to_numpy(), tgt.to_numpy(), rate.to_numpy()

    for i in range(len(idx)):
        p = px_np[i]
        if i > 0:
            cash *= 1.0 + rate_np[i] / 252.0
        equity = cash + float(np.nansum(shares * p))
        dd_scale = guard.update(equity) if cfg.use_drawdown_guard else 1.0
        desired = cap_gross({s: tgt_np[i][j] * dd_scale for j, s in enumerate(syms)}, risk)
        for j, s in enumerate(syms):
            price = p[j]
            if np.isnan(price) or price <= 0:
                continue
            target_val = desired[s] * equity
            current_val = shares[j] * price
            delta = target_val - current_val
            full_exit = desired[s] == 0.0 and shares[j] != 0
            if abs(delta) <= risk.rebalance_band * equity and not full_exit:
                continue
            if full_exit:
                delta = -current_val
            cost = abs(delta) * cfg.cost_bps / 1e4
            cash -= delta + cost
            shares[j] += delta / price
            if full_exit:
                shares[j] = 0.0
            costs_paid += cost
            notional_traded += abs(delta) / equity
            trades.append({"date": idx[i], "symbol": s, "notional": delta, "price": price, "cost": cost, "weight_after": desired[s]})
        equity = cash + float(np.nansum(shares * p))
        equity_hist[i] = equity
        weight_hist[i] = np.where(np.isnan(p), 0.0, shares * p / equity)

    equity_s = pd.Series(equity_hist, index=idx, name="equity")
    returns = equity_s.pct_change().fillna(0.0).rename("return")
    weights = pd.DataFrame(weight_hist, index=idx, columns=syms)
    bench_alloc = benchmark_allocations or {s: 1.0 / len(syms) for s in syms}
    asset_rets = px.pct_change().fillna(0.0)
    bench = sum(asset_rets[s] * w for s, w in bench_alloc.items() if s in asset_rets).rename("benchmark")
    years = max(len(idx) / 252.0, 1e-9)
    res = BacktestResult(
        equity=equity_s,
        returns=returns,
        weights=weights,
        trades=pd.DataFrame(trades),
        benchmark_returns=bench,
        costs_paid=costs_paid,
        turnover=notional_traded / years,
    )
    rf_daily = rate / 252.0
    res.metrics = compute_metrics(returns, exposure=weights.sum(axis=1), rf_daily=rf_daily)
    res.benchmark_metrics = compute_metrics(bench, exposure=pd.Series(1.0, index=idx), rf_daily=rf_daily)
    return res
