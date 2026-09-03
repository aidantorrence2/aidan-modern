import numpy as np
import pandas as pd

from tradingbot import indicators as ind


def test_sma_matches_manual():
    s = pd.Series([1.0, 2.0, 3.0, 4.0, 5.0])
    out = ind.sma(s, 3)
    assert np.isnan(out.iloc[1])
    assert out.iloc[2] == 2.0 and out.iloc[4] == 4.0


def test_rsi_bounds_and_extremes():
    up = pd.Series(np.arange(1, 30, dtype=float))
    assert ind.rsi(up, 2).dropna().iloc[-1] == 100.0
    down = pd.Series(np.arange(30, 1, -1, dtype=float))
    assert ind.rsi(down, 2).dropna().iloc[-1] == 0.0
    rng = np.random.default_rng(0)
    noisy = pd.Series(100 + rng.normal(0, 1, 500).cumsum())
    r = ind.rsi(noisy, 2).dropna()
    assert r.between(0, 100).all()


def test_realized_vol_scale():
    rng = np.random.default_rng(3)
    close = pd.Series(100 * np.exp(np.cumsum(rng.normal(0, 0.01, 5000))))
    rv = ind.realized_vol(close, 250).dropna()
    assert abs(rv.mean() - 0.01 * np.sqrt(252)) < 0.02


def test_consecutive_down_days():
    s = pd.Series([5, 4, 3, 4, 3, 2, 1, 2.0])
    assert ind.consecutive_down_days(s).tolist() == [0, 1, 2, 0, 1, 2, 3, 0]


def test_drawdown():
    eq = pd.Series([1.0, 1.2, 0.9, 1.3, 1.0])
    dd = ind.drawdown(eq)
    assert dd.iloc[2] == 0.9 / 1.2 - 1 and dd.iloc[3] == 0.0
