"""Signal sleeves. Each returns a *raw* target weight series in [0, 1+] per asset, computed only from
information available at each date's close. Position sizing, vol targeting and drawdown guards are
applied later by the risk layer, so strategies stay simple and testable.

Why these two sleeves and not something fancier:

* Trend (close above its long moving average -> long, else cash). Documented across every asset class
  and century of data (Faber 2007; Moskowitz, Ooi & Pedersen 2012). It does not win more days than
  buy-and-hold, but it sidesteps the fat left tail: nearly every catastrophic month in equities happened
  with price below the 200-day average.
* Short-term mean reversion inside an uptrend (buy a 2-day RSI washout, sell the snap-back). Connors &
  Alvarez documented 70-80% per-trade hit rates in index ETFs; it is the single highest-probability
  entry in daily-bar equities and it is uncorrelated with the trend sleeve day-to-day.
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

from . import indicators as ind


@dataclass
class TrendFollowing:
    """Long when close > SMA(sma_len); optionally also require positive 12-1 momentum."""

    sma_len: int = 200
    require_momentum: bool = False
    momentum_len: int = 252
    weight: float = 1.0
    name: str = "trend"

    def target_weights(self, bars: pd.DataFrame) -> pd.Series:
        close = bars["close"]
        on = close > ind.sma(close, self.sma_len)
        if self.require_momentum:
            on &= ind.momentum(close, self.momentum_len) > 0
        w = on.astype(float) * self.weight
        w[ind.sma(close, self.sma_len).isna()] = 0.0
        return w.rename(self.name)


@dataclass
class MeanReversion:
    """Connors-style RSI(2) pullback buyer.

    Entry: RSI(rsi_len) < entry OR `down_days` consecutive lower closes.
    Exit:  RSI > exit, or close back above SMA(exit_sma).
    Size:  bull_weight when close > SMA(regime_len), bear_weight otherwise (default 0: do not catch
           knives in a downtrend), a hard time stop after max_hold days, and (exit_on_regime_break) an
           immediate exit if the trend breaks while a bull-regime pullback trade is open.
    """

    rsi_len: int = 2
    entry: float = 10.0
    exit: float = 65.0
    exit_sma: int = 5
    down_days: int = 3
    regime_len: int = 200
    bull_weight: float = 0.5
    bear_weight: float = 0.0
    max_hold: int = 10
    exit_on_regime_break: bool = True
    name: str = "meanrev"

    def target_weights(self, bars: pd.DataFrame) -> pd.Series:
        close = bars["close"]
        rsi = ind.rsi(close, self.rsi_len).to_numpy()
        sma_exit = ind.sma(close, self.exit_sma).to_numpy()
        regime = (close > ind.sma(close, self.regime_len)).to_numpy()
        regime_ready = ind.sma(close, self.regime_len).notna().to_numpy()
        dd = ind.consecutive_down_days(close).to_numpy()
        c = close.to_numpy()
        n = len(c)
        w = np.zeros(n)
        in_pos, held, size = False, 0, 0.0
        for i in range(n):
            if np.isnan(rsi[i]) or np.isnan(sma_exit[i]) or not regime_ready[i]:
                continue
            if in_pos:
                held += 1
                broke = self.exit_on_regime_break and size == self.bull_weight and not regime[i]
                if rsi[i] > self.exit or c[i] > sma_exit[i] or held >= self.max_hold or broke:
                    in_pos = False
                    size = 0.0
            if not in_pos:
                washed_out = rsi[i] < self.entry or dd[i] >= self.down_days
                if washed_out:
                    size = self.bull_weight if regime[i] else self.bear_weight
                    if size > 0:
                        in_pos, held = True, 0
            w[i] = size if in_pos else 0.0
        return pd.Series(w, index=close.index, name=self.name)


@dataclass
class Ensemble:
    """Sum of sleeve weights, clipped to [0, max_weight]. Long-only by construction."""

    sleeves: list
    max_weight: float = 1.0
    name: str = "ensemble"

    def components(self, bars: pd.DataFrame) -> pd.DataFrame:
        return pd.concat([s.target_weights(bars) for s in self.sleeves], axis=1)

    def target_weights(self, bars: pd.DataFrame) -> pd.Series:
        return self.components(bars).sum(axis=1).clip(0.0, self.max_weight).rename(self.name)


def build_ensemble(cfg: dict) -> Ensemble:
    """Construct from the `strategy:` section of config.yaml."""
    sleeves = []
    t = cfg.get("trend")
    if t and t.get("enabled", True):
        sleeves.append(TrendFollowing(**{k: v for k, v in t.items() if k != "enabled"}))
    m = cfg.get("mean_reversion")
    if m and m.get("enabled", True):
        sleeves.append(MeanReversion(**{k: v for k, v in m.items() if k != "enabled"}))
    if not sleeves:
        raise ValueError("no strategy sleeves enabled")
    return Ensemble(sleeves, max_weight=float(cfg.get("max_weight", 1.0)))
