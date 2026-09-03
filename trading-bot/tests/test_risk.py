import numpy as np
import pandas as pd

from tradingbot.risk import DrawdownGuard, RiskConfig, cap_gross, vol_scale

from conftest import make_bars


def test_vol_scale_inverse_to_vol_and_capped():
    calm = make_bars(300, seed=1, vol=0.004)
    wild = make_bars(300, seed=1, vol=0.03)
    cfg = RiskConfig(target_vol=0.12, use_implied_vol=False, max_scale=1.0)
    assert vol_scale(calm["close"], cfg).iloc[-1] == 1.0
    assert 0 < vol_scale(wild["close"], cfg).iloc[-1] < 0.4


def test_implied_vol_only_reduces_exposure():
    b = make_bars(300, seed=4, vol=0.006)
    cfg = RiskConfig(target_vol=0.12)
    iv = pd.Series(60.0, index=b.index)
    assert vol_scale(b["close"], cfg, iv).iloc[-1] < vol_scale(b["close"], cfg).iloc[-1]
    assert abs(vol_scale(b["close"], cfg, iv).iloc[-1] - 0.2) < 1e-9


def test_drawdown_guard_levels_and_recovery():
    g = DrawdownGuard(RiskConfig(drawdown_soft=0.08, drawdown_hard=0.15, soft_scale=0.5, hard_scale=0.25, recover_to=0.04))
    assert g.update(100) == 1.0
    assert g.update(95) == 1.0
    assert g.update(91) == 0.5
    assert g.update(84) == 0.25
    assert g.update(90) == 0.25  # still below soft after hard: stays braked
    assert g.update(97) == 1.0  # recovered to within 4% of peak


def test_cap_gross():
    cfg = RiskConfig(max_asset_weight=0.6, max_gross=1.0)
    out = cap_gross({"A": 0.9, "B": 0.9}, cfg)
    assert abs(sum(out.values()) - 1.0) < 1e-9 and out["A"] == out["B"]
    assert cap_gross({"A": -0.5}, cfg)["A"] == 0.0
