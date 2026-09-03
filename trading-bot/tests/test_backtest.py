import numpy as np
import pandas as pd

from tradingbot.backtest import BacktestConfig, run_backtest
from tradingbot.metrics import compute_metrics
from tradingbot.risk import RiskConfig

from conftest import make_bars


def test_constant_full_weight_matches_buy_and_hold_without_costs():
    b = make_bars(500, seed=7)
    closes = pd.DataFrame({"X": b["close"]})
    tgt = pd.DataFrame({"X": 1.0}, index=b.index)
    res = run_backtest(closes, tgt, RiskConfig(rebalance_band=0.0), BacktestConfig(cost_bps=0, execution_lag=0, use_drawdown_guard=False))
    expected = closes["X"].iloc[-1] / closes["X"].iloc[0] * 100_000
    assert abs(res.equity.iloc[-1] - expected) < 1e-6


def test_costs_reduce_equity_and_are_counted():
    b = make_bars(500, seed=7)
    closes = pd.DataFrame({"X": b["close"]})
    tgt = pd.DataFrame({"X": (np.arange(500) % 10 < 5).astype(float)}, index=b.index)
    free = run_backtest(closes, tgt, RiskConfig(), BacktestConfig(cost_bps=0, use_drawdown_guard=False))
    paid = run_backtest(closes, tgt, RiskConfig(), BacktestConfig(cost_bps=10, use_drawdown_guard=False))
    assert paid.costs_paid > 0 and paid.equity.iloc[-1] < free.equity.iloc[-1]
    assert free.costs_paid == 0 and len(paid.trades) == len(free.trades)


def test_execution_lag_shifts_positions():
    b = make_bars(300, seed=9)
    closes = pd.DataFrame({"X": b["close"]})
    tgt = pd.DataFrame({"X": 0.0}, index=b.index)
    tgt.iloc[100] = 1.0
    tgt.iloc[101:] = 0.0
    res = run_backtest(closes, tgt, RiskConfig(rebalance_band=0.0), BacktestConfig(cost_bps=0, execution_lag=1, use_drawdown_guard=False))
    # the one-day position is held from close 101 to close 102
    assert res.weights["X"].iloc[101] > 0.99 and res.weights["X"].iloc[100] == 0 and res.weights["X"].iloc[102] == 0


def test_cash_earns_rate_when_flat():
    b = make_bars(252, seed=1)
    closes = pd.DataFrame({"X": b["close"]})
    tgt = pd.DataFrame({"X": 0.0}, index=b.index)
    rate = pd.Series(5.0, index=b.index)  # percent
    res = run_backtest(closes, tgt, RiskConfig(), BacktestConfig(cost_bps=0), cash_rate=rate)
    assert abs(res.equity.iloc[-1] / 100_000 - (1 + 0.05 / 252) ** 251) < 1e-9
    assert res.metrics["loss_day_rate"] == 0.0


def test_drawdown_guard_reduces_exposure_after_losses():
    n = 400
    idx = pd.bdate_range("2015-01-01", periods=n)
    close = pd.Series(np.concatenate([np.linspace(100, 120, 200), np.linspace(120, 90, 200)]), index=idx)
    closes = pd.DataFrame({"X": close})
    tgt = pd.DataFrame({"X": 1.0}, index=idx)
    guarded = run_backtest(closes, tgt, RiskConfig(), BacktestConfig(cost_bps=0, use_drawdown_guard=True))
    naked = run_backtest(closes, tgt, RiskConfig(), BacktestConfig(cost_bps=0, use_drawdown_guard=False))
    assert guarded.metrics["max_drawdown"] > naked.metrics["max_drawdown"]
    assert guarded.weights["X"].iloc[-1] < 0.5


def test_metrics_basic():
    r = pd.Series([0.01, -0.02, 0.0, 0.03], index=pd.bdate_range("2020-01-01", periods=4))
    m = compute_metrics(r)
    assert m["loss_day_rate"] == 0.25 and m["flat_day_rate"] == 0.25 and m["worst_day"] == -0.02
