import numpy as np
import pandas as pd

from tradingbot.strategies import Ensemble, MeanReversion, TrendFollowing, build_ensemble

from conftest import make_bars


def test_trend_is_long_in_uptrend_flat_in_downtrend():
    n = 600
    idx = pd.bdate_range("2015-01-01", periods=n)
    up = pd.Series(np.linspace(100, 200, n), index=idx)
    down = pd.Series(np.linspace(200, 100, n), index=idx)
    for s, expect in ((up, 1.0), (down, 0.0)):
        bars = pd.DataFrame({"open": s, "high": s, "low": s, "close": s, "volume": 1}, index=idx)
        w = TrendFollowing(sma_len=50).target_weights(bars)
        assert w.iloc[-1] == expect


def test_mean_reversion_enters_on_washout_and_exits():
    bars = make_bars(700, seed=5)
    w = MeanReversion(bull_weight=0.3, bear_weight=0.0).target_weights(bars)
    assert set(np.unique(w.round(6))) <= {0.0, 0.3}
    assert (w > 0).any(), "should have traded at least once in 700 noisy days"
    # never hold longer than max_hold consecutive days
    runs, run = [], 0
    for v in w:
        run = run + 1 if v > 0 else 0
        runs.append(run)
    assert max(runs) <= MeanReversion().max_hold + 1


def test_mean_reversion_never_trades_below_regime_when_bear_weight_zero():
    n = 600
    idx = pd.bdate_range("2015-01-01", periods=n)
    s = pd.Series(np.linspace(200, 100, n) + np.sin(np.arange(n)) * 3, index=idx)
    bars = pd.DataFrame({"open": s, "high": s, "low": s, "close": s, "volume": 1}, index=idx)
    w = MeanReversion(bear_weight=0.0).target_weights(bars)
    assert (w.iloc[250:] == 0).all()


def test_ensemble_is_clipped_and_long_only(bars):
    ens = Ensemble([TrendFollowing(weight=0.9), MeanReversion(bull_weight=0.5)], max_weight=1.0)
    w = ens.target_weights(bars)
    assert w.between(0, 1).all()


def test_build_ensemble_from_config():
    ens = build_ensemble({"trend": {"sma_len": 100, "weight": 0.6}, "mean_reversion": {"entry": 5, "bull_weight": 0.4}, "max_weight": 1.0})
    assert isinstance(ens.sleeves[0], TrendFollowing) and ens.sleeves[0].sma_len == 100
    assert isinstance(ens.sleeves[1], MeanReversion) and ens.sleeves[1].entry == 5
