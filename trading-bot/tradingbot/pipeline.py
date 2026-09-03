"""Shared signal pipeline: bars -> raw sleeve weights -> vol-scaled, allocation-weighted targets.

The backtester and the live engine both call `compute_targets`, so what is tested is what trades."""
from __future__ import annotations

import pandas as pd

from .risk import RiskConfig, vol_scale
from .strategies import Ensemble


def compute_targets(
    bars_by_symbol: dict[str, pd.DataFrame],
    allocations: dict[str, float],
    ensemble: Ensemble,
    risk: RiskConfig,
    implied_vol: pd.Series | None = None,
    implied_vol_symbols: set[str] | None = None,
) -> tuple[pd.DataFrame, dict[str, pd.DataFrame]]:
    """Returns (targets, diagnostics). targets[symbol] is the pre-guard weight of total equity to hold."""
    targets, diags = {}, {}
    for sym, bars in bars_by_symbol.items():
        comps = ensemble.components(bars)
        raw = comps.sum(axis=1).clip(0.0, ensemble.max_weight)
        use_iv = implied_vol if (implied_vol is not None and (implied_vol_symbols is None or sym in implied_vol_symbols)) else None
        vs = vol_scale(bars["close"], risk, use_iv)
        w = (raw * vs * allocations.get(sym, 0.0)).clip(0.0, risk.max_asset_weight)
        targets[sym] = w
        d = comps.copy()
        d["raw"] = raw
        d["vol_scale"] = vs
        d["target"] = w
        d["close"] = bars["close"]
        diags[sym] = d
    return pd.DataFrame(targets), diags
