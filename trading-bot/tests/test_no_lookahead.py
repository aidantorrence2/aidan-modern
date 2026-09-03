"""Every signal at date t must be identical whether or not data after t exists."""
import pandas as pd

from tradingbot.pipeline import compute_targets
from tradingbot.risk import RiskConfig
from tradingbot.strategies import Ensemble, MeanReversion, TrendFollowing

from conftest import make_bars


def test_targets_do_not_change_when_future_is_removed():
    bars = make_bars(900, seed=11)
    ens = Ensemble([TrendFollowing(weight=0.7), MeanReversion(bull_weight=0.3)])
    risk = RiskConfig()
    iv = pd.Series(18.0, index=bars.index)
    full, _ = compute_targets({"X": bars}, {"X": 1.0}, ens, risk, iv, {"X"})
    cut = bars.iloc[:600]
    part, _ = compute_targets({"X": cut}, {"X": 1.0}, ens, risk, iv.iloc[:600], {"X"})
    pd.testing.assert_series_equal(full["X"].iloc[:600], part["X"], check_names=False)


def test_indicator_warmup_is_flat():
    bars = make_bars(400, seed=2)
    w = TrendFollowing(sma_len=200).target_weights(bars)
    assert (w.iloc[:199] == 0).all()
