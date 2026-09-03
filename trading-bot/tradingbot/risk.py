"""Risk overlay: everything that turns a raw signal into a survivable position.

1. Volatility targeting: scale exposure by target_vol / max(realized_vol, implied_vol). Loss days
   cluster in high-vol regimes; sizing down there removes most of the > -2% days without giving up
   much upside (Moreira & Muir 2017, "Volatility-Managed Portfolios").
2. Drawdown guard: path-dependent brake on the *strategy's own* equity. Cut to soft_scale below a
   soft drawdown, hard_scale below a hard drawdown, restore when equity recovers.
3. Daily loss kill switch (live only, see engine.py): flatten and stop for the day if intraday equity
   falls more than max_daily_loss_pct below the start-of-day mark.
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

from . import indicators as ind


@dataclass
class RiskConfig:
    target_vol: float = 0.12
    vol_lookback: int = 20
    use_implied_vol: bool = True
    implied_vol_weight: float = 1.0
    max_scale: float = 1.0
    min_scale: float = 0.0
    max_asset_weight: float = 1.0
    max_gross: float = 1.0
    drawdown_soft: float = 0.08
    drawdown_hard: float = 0.15
    soft_scale: float = 0.5
    hard_scale: float = 0.25
    recover_to: float = 0.04
    rebalance_band: float = 0.05
    max_daily_loss_pct: float = 0.02

    @classmethod
    def from_dict(cls, d: dict | None) -> "RiskConfig":
        d = d or {}
        known = {k: v for k, v in d.items() if k in cls.__dataclass_fields__}
        return cls(**known)


def vol_scale(close: pd.Series, cfg: RiskConfig, implied_vol: pd.Series | None = None) -> pd.Series:
    """Exposure multiplier in [min_scale, max_scale] from ex-ante volatility."""
    rv = ind.realized_vol(close, cfg.vol_lookback)
    if cfg.use_implied_vol and implied_vol is not None:
        iv = implied_vol.reindex(close.index).ffill() / 100.0 * cfg.implied_vol_weight
        rv = pd.concat([rv, iv], axis=1).max(axis=1)
        rv[ind.realized_vol(close, cfg.vol_lookback).isna()] = np.nan
    scale = (cfg.target_vol / rv).clip(lower=cfg.min_scale, upper=cfg.max_scale)
    return scale.fillna(0.0).rename("vol_scale")


class DrawdownGuard:
    """Stateful brake. Call update(equity) once per bar and multiply exposure by the result."""

    def __init__(self, cfg: RiskConfig):
        self.cfg = cfg
        self.peak = -np.inf
        self.level = 0  # 0 normal, 1 soft, 2 hard

    @property
    def scale(self) -> float:
        return {0: 1.0, 1: self.cfg.soft_scale, 2: self.cfg.hard_scale}[self.level]

    def update(self, equity: float) -> float:
        self.peak = max(self.peak, equity)
        dd = equity / self.peak - 1.0
        if dd <= -self.cfg.drawdown_hard:
            self.level = 2
        elif dd <= -self.cfg.drawdown_soft:
            self.level = max(self.level, 1)
        elif dd >= -self.cfg.recover_to:
            self.level = 0
        return self.scale


def cap_gross(weights: dict[str, float], cfg: RiskConfig) -> dict[str, float]:
    """Clip each asset to max_asset_weight, then shrink proportionally so gross <= max_gross."""
    capped = {k: float(np.clip(v, 0.0, cfg.max_asset_weight)) for k, v in weights.items()}
    gross = sum(abs(v) for v in capped.values())
    if gross > cfg.max_gross and gross > 0:
        capped = {k: v * cfg.max_gross / gross for k, v in capped.items()}
    return capped
