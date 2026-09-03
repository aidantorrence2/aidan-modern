"""Vectorised technical indicators. Every function is causal: the value at date t only uses
data up to and including t. That property is asserted in tests/test_no_lookahead.py."""
from __future__ import annotations

import numpy as np
import pandas as pd

TRADING_DAYS = 252


def sma(s: pd.Series, n: int) -> pd.Series:
    return s.rolling(n, min_periods=n).mean()


def ema(s: pd.Series, n: int) -> pd.Series:
    return s.ewm(span=n, adjust=False, min_periods=n).mean()


def rsi(close: pd.Series, n: int = 2) -> pd.Series:
    """Wilder RSI. Short lookbacks (2-4) are the classic Connors mean-reversion input."""
    delta = close.diff()
    up = delta.clip(lower=0.0)
    down = -delta.clip(upper=0.0)
    avg_up = up.ewm(alpha=1.0 / n, adjust=False, min_periods=n).mean()
    avg_down = down.ewm(alpha=1.0 / n, adjust=False, min_periods=n).mean()
    out = pd.Series(np.nan, index=close.index)
    both_zero = (avg_up == 0) & (avg_down == 0)
    rs = avg_up / avg_down.replace(0.0, np.nan)
    out = 100.0 - 100.0 / (1.0 + rs)
    out = out.where(avg_down != 0, 100.0)
    out = out.where(~both_zero, 50.0)
    out[avg_up.isna() | avg_down.isna()] = np.nan
    return out


def log_returns(close: pd.Series) -> pd.Series:
    return np.log(close).diff()


def realized_vol(close: pd.Series, n: int = 20, annualize: int = TRADING_DAYS) -> pd.Series:
    """Annualised close-to-close volatility over the last n returns."""
    return log_returns(close).rolling(n, min_periods=n).std(ddof=1) * np.sqrt(annualize)


def atr(df: pd.DataFrame, n: int = 14) -> pd.Series:
    prev_close = df["close"].shift(1)
    tr = pd.concat(
        [df["high"] - df["low"], (df["high"] - prev_close).abs(), (df["low"] - prev_close).abs()],
        axis=1,
    ).max(axis=1)
    return tr.ewm(alpha=1.0 / n, adjust=False, min_periods=n).mean()


def drawdown(equity: pd.Series) -> pd.Series:
    return equity / equity.cummax() - 1.0


def consecutive_down_days(close: pd.Series) -> pd.Series:
    """Number of consecutive days the close has fallen, as of each date."""
    down = (close.diff() < 0).astype(int).to_numpy()
    out = np.zeros(len(down), dtype=int)
    run = 0
    for i, d in enumerate(down):
        run = run + 1 if d else 0
        out[i] = run
    return pd.Series(out, index=close.index)


def rolling_low(s: pd.Series, n: int) -> pd.Series:
    return s.rolling(n, min_periods=n).min()


def rolling_high(s: pd.Series, n: int) -> pd.Series:
    return s.rolling(n, min_periods=n).max()


def momentum(close: pd.Series, n: int = 252, skip: int = 21) -> pd.Series:
    """Classic 12-1 momentum: return over the last n days excluding the most recent `skip`."""
    return close.shift(skip) / close.shift(n) - 1.0
