import json

import pandas as pd

from tradingbot.broker import PaperBroker
from tradingbot.config import DEFAULTS, load_config
from tradingbot.data import DataHub
from tradingbot.engine import Engine

from conftest import make_bars


def test_paper_broker_round_trip(tmp_path):
    prices = {"SPY": 100.0}
    b = PaperBroker(tmp_path / "p.json", lambda s: prices[s], initial_cash=10_000, slippage_bps=0)
    b.submit_market_order("SPY", 5_000, "buy")
    assert b.positions()["SPY"].qty == 50 and b.account()["cash"] == 5_000
    prices["SPY"] = 110.0
    assert abs(b.account()["equity"] - 10_500) < 1e-9
    b.close_position("SPY")
    assert not b.positions() and abs(b.account()["cash"] - 10_500) < 1e-9
    # state persisted
    b2 = PaperBroker(tmp_path / "p.json", lambda s: prices[s])
    assert abs(b2.account()["cash"] - 10_500) < 1e-9


class FakeHub(DataHub):
    def __init__(self, bars):
        self._bars = bars

    def get(self, symbol_map, label, start=None, force_refresh=False):
        if label == "implied_vol":
            return pd.DataFrame({"close": 16.0}, index=self._bars.index)
        if label == "cash_rate":
            return pd.DataFrame({"close": 4.0}, index=self._bars.index)
        return self._bars


def _cfg(tmp_path):
    cfg = json.loads(json.dumps(DEFAULTS))
    cfg["universe"] = [{"symbol": "SPY", "allocation": 1.0, "data": {"fred": "x"}}]
    cfg["implied_vol"]["applies_to"] = ["SPY"]
    cfg["engine"]["state_dir"] = str(tmp_path / "state")
    cfg["broker"]["paper_state"] = str(tmp_path / "paper.json")
    return cfg


def test_engine_dry_run_produces_orders_and_kill_switch(tmp_path):
    bars = make_bars(600, seed=3, drift=0.001)  # strong uptrend -> should want exposure
    cfg = _cfg(tmp_path)
    eng = Engine(cfg, FakeHub(bars))
    last = float(bars["close"].iloc[-1])
    broker = PaperBroker(cfg["broker"]["paper_state"], lambda s: last, initial_cash=100_000)
    eng.broker = broker
    rep = eng.run_once(dry_run=True, force_refresh=False)
    assert rep["action"] == "rebalanced" and rep["orders"][0]["side"] == "buy"
    assert 0 < rep["targets"]["SPY"] <= 1.0
    assert not broker.positions(), "dry run must not trade"

    rep = eng.run_once(dry_run=False, force_refresh=False)
    assert broker.positions()["SPY"].market_value > 0

    # simulate a -10% day: kill switch flattens and halts
    last *= 0.90
    broker.price_lookup = lambda s: last
    rep = eng.run_once(dry_run=False, force_refresh=False)
    assert rep["action"] == "kill_switch" and not broker.positions()
    rep = eng.run_once(dry_run=False, force_refresh=False)
    assert rep["action"] == "halted_today"


def test_load_config_merges_defaults(tmp_path):
    p = tmp_path / "c.yaml"
    p.write_text("risk:\n  target_vol: 0.2\nuniverse:\n  - symbol: QQQ\n    allocation: 1.0\n    data: {fred: NASDAQ100}\n")
    cfg = load_config(p)
    assert cfg["risk"]["target_vol"] == 0.2 and cfg["risk"]["drawdown_soft"] == 0.08
    assert [u["symbol"] for u in cfg["universe"]] == ["QQQ"]
