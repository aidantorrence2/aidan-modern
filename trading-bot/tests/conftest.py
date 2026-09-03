import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


def make_bars(n: int = 800, seed: int = 1, drift: float = 0.0004, vol: float = 0.012) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    r = rng.normal(drift, vol, n)
    close = 100 * np.cumprod(1 + r)
    idx = pd.bdate_range("2015-01-01", periods=n)
    df = pd.DataFrame({"open": close, "high": close * 1.005, "low": close * 0.995, "close": close, "volume": 1e6}, index=idx)
    df.index.name = "date"
    df.attrs["has_ohlc"] = True
    return df


@pytest.fixture
def bars() -> pd.DataFrame:
    return make_bars()
