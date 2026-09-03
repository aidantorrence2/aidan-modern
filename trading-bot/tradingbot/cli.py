"""Command line: backtest | sensitivity | walkforward | montecarlo | run | status | signals."""
from __future__ import annotations

import argparse
import json
import logging
import sys
from datetime import datetime
from pathlib import Path

import pandas as pd

from .backtest import BacktestConfig
from .broker import build_broker
from .config import allocations, load_config
from .data import DataHub
from .engine import Engine
from .metrics import compare, format_metrics, yearly_table
from .walkforward import block_bootstrap, bootstrap_summary, full_backtest, sensitivity, walk_forward

pd.set_option("display.width", 160)
pd.set_option("display.max_columns", 30)


def _hub(cfg: dict, sources: str | None) -> DataHub:
    d = cfg["data"]
    order = sources.split(",") if sources else d["sources"]
    return DataHub(order, d["cache_dir"], d.get("max_age_hours", 12), d.get("csv_dir"))


def _load(cfg, args):
    hub = _hub(cfg, args.sources)
    eng = Engine(cfg, hub)
    start = datetime.fromisoformat(args.data_start) if getattr(args, "data_start", None) else None
    bars, implied, cash_rate = eng.load_market_data(start=start, force_refresh=getattr(args, "refresh", False))
    for s, b in bars.items():
        print(f"  {s:8s} {b.index[0].date()} -> {b.index[-1].date()}  {len(b):6d} bars  source={b.attrs.get('source')}  ohlc={b.attrs.get('has_ohlc')}")
    if implied is not None:
        print(f"  implied vol {implied.index[0].date()} -> {implied.index[-1].date()}")
    if cash_rate is not None:
        print(f"  cash rate   {cash_rate.index[0].date()} -> {cash_rate.index[-1].date()}")
    return eng, bars, implied, cash_rate


def _bt_overrides(args) -> dict:
    o = {}
    if getattr(args, "start", None):
        o["start"] = args.start
    if getattr(args, "end", None):
        o["end"] = args.end
    if getattr(args, "cost_bps", None) is not None:
        o["cost_bps"] = args.cost_bps
    if getattr(args, "lag", None) is not None:
        o["execution_lag"] = args.lag
    if getattr(args, "no_guard", False):
        o["use_drawdown_guard"] = False
    return o


def cmd_backtest(cfg, args):
    _, bars, implied, cash_rate = _load(cfg, args)
    if args.no_cash_yield:
        cash_rate = None
    res = full_backtest(cfg, bars, implied, cash_rate, allocations(cfg), _bt_overrides(args))
    print("\n=== Strategy vs buy-and-hold (same allocation) ===")
    df = compare(res.metrics, res.benchmark_metrics)
    print(df.map(lambda v: f"{v:.4f}" if isinstance(v, float) else v).to_string())
    print("\n=== Strategy detail ===")
    print(format_metrics(res.metrics))
    print(f"\ncosts paid: {res.costs_paid:,.0f}  turnover/yr: {res.turnover:.2f}x  trades: {len(res.trades)}")
    print("\n=== Calendar-year returns ===")
    print(yearly_table(res.returns, res.benchmark_returns).map(lambda v: f"{v*100:7.2f}%").to_string())
    if args.out:
        out = Path(args.out)
        out.mkdir(parents=True, exist_ok=True)
        pd.concat([res.equity, res.returns, res.benchmark_returns, res.weights], axis=1).to_csv(out / "equity.csv")
        res.trades.to_csv(out / "trades.csv", index=False)
        (out / "metrics.json").write_text(json.dumps({"strategy": res.metrics, "benchmark": res.benchmark_metrics}, indent=2, default=float))
        print(f"\nwrote {out}/equity.csv, trades.csv, metrics.json")
    return res


def cmd_sensitivity(cfg, args):
    _, bars, implied, cash_rate = _load(cfg, args)
    grid = json.loads(args.grid) if args.grid else None
    df = sensitivity(cfg, bars, implied, cash_rate, allocations(cfg), grid)
    print("\n=== Parameter sensitivity (every row should be profitable if the edge is real) ===")
    print(df.to_string(index=False, float_format=lambda v: f"{v:.3f}"))
    print(f"\nprofitable combos: {(df['cagr'] > 0).sum()}/{len(df)}   min sharpe {df['sharpe'].min():.2f}   worst max_dd {df['max_dd'].min():.3f}")


def cmd_walkforward(cfg, args):
    _, bars, implied, cash_rate = _load(cfg, args)
    grid = json.loads(args.grid) if args.grid else None
    wf = walk_forward(cfg, bars, implied, cash_rate, allocations(cfg), grid, args.train_years, args.test_years, args.objective)
    print("\n=== Walk-forward folds (parameters chosen on the prior train window only) ===")
    print(wf.folds.to_string(index=False, float_format=lambda v: f"{v:.3f}"))
    print("\n=== Out-of-sample performance (concatenated test windows) ===")
    print(format_metrics(wf.metrics))


def cmd_montecarlo(cfg, args):
    _, bars, implied, cash_rate = _load(cfg, args)
    res = full_backtest(cfg, bars, implied, cash_rate, allocations(cfg), _bt_overrides(args))
    sim = block_bootstrap(res.returns, n_sims=args.sims)
    bench = block_bootstrap(res.benchmark_returns, n_sims=args.sims)
    df = pd.DataFrame({"strategy": bootstrap_summary(sim), "buy_and_hold": bootstrap_summary(bench)})
    print(f"\n=== Block-bootstrap Monte Carlo: {args.sims} simulated years ===")
    print(df.map(lambda v: f"{v:.3f}").to_string())


def cmd_signals(cfg, args):
    eng, bars, implied, _ = _load(cfg, args)
    latest, diag = eng.targets(bars, implied)
    print("\n=== Latest signal diagnostics ===")
    print(diag.to_string())
    print("\npre-guard target weights:", {k: round(v, 4) for k, v in latest.items()})


def cmd_run(cfg, args):
    hub = _hub(cfg, args.sources)
    if args.broker:
        cfg["broker"]["type"] = args.broker
    eng = Engine(cfg, hub)
    cache: dict[str, float] = {}

    def price_lookup(sym: str) -> float:
        if sym not in cache:
            u = next(u for u in cfg["universe"] if u["symbol"] == sym)
            cache[sym] = float(hub.get(u["data"], sym)["close"].iloc[-1])
        return cache[sym]

    eng.broker = build_broker(cfg, price_lookup)
    if cfg["broker"]["type"] == "alpaca" and not eng.broker.is_market_open() and not args.force:
        print("market closed (Alpaca clock); pass --force to run anyway")
        return
    report = eng.run_once(dry_run=not args.live, force_refresh=not args.no_refresh)
    print(json.dumps({k: v for k, v in report.items() if k != "diagnostics"}, indent=2, default=str))
    if "diagnostics" in report:
        print(pd.DataFrame(report["diagnostics"]).T.to_string())
    if not args.live:
        print("\nDRY RUN: no orders were sent. Add --live to trade.")


def cmd_status(cfg, args):
    state = Path(cfg["engine"]["state_dir"]) / "engine_state.json"
    print(state.read_text() if state.exists() else "no engine state yet")
    log_path = Path(cfg["engine"]["state_dir"]) / "activity.jsonl"
    if log_path.exists():
        lines = log_path.read_text().strip().splitlines()[-args.n:]
        print(f"\nlast {len(lines)} activity records:")
        for ln in lines:
            rec = json.loads(ln)
            print(f"  {rec['ts'][:19]} {rec.get('action','?'):14s} equity={rec.get('equity', 0):,.2f} orders={len(rec.get('orders', []))}")
    if cfg["broker"]["type"] == "paper" and Path(cfg["broker"]["paper_state"]).exists():
        st = json.loads(Path(cfg["broker"]["paper_state"]).read_text())
        print(f"\npaper broker: cash={st['cash']:,.2f} positions={ {k: round(v['qty'], 4) for k, v in st['positions'].items() if v['qty']} }")


def main(argv=None):
    p = argparse.ArgumentParser(prog="tradingbot", description=__doc__)
    p.add_argument("--config", default=str(Path(__file__).resolve().parent.parent / "config.yaml"))
    p.add_argument("--sources", help="comma-separated provider order override, e.g. fred or yahoo,stooq")
    p.add_argument("--data-start", help="earliest date to fetch, ISO")
    p.add_argument("--refresh", action="store_true", help="ignore cache")
    p.add_argument("-v", "--verbose", action="store_true")
    sub = p.add_subparsers(dest="cmd", required=True)

    def add_bt(sp):
        sp.add_argument("--start")
        sp.add_argument("--end")
        sp.add_argument("--cost-bps", type=float)
        sp.add_argument("--lag", type=int)
        sp.add_argument("--no-guard", action="store_true")
        sp.add_argument("--no-cash-yield", action="store_true")

    s = sub.add_parser("backtest", help="full-history backtest vs buy-and-hold")
    add_bt(s)
    s.add_argument("--out", help="directory for equity.csv / trades.csv / metrics.json")
    s.set_defaults(fn=cmd_backtest)
    s = sub.add_parser("sensitivity", help="parameter grid robustness table")
    s.add_argument("--grid", help="JSON dict of dotted-path -> list")
    s.set_defaults(fn=cmd_sensitivity)
    s = sub.add_parser("walkforward", help="rolling out-of-sample parameter selection")
    s.add_argument("--grid")
    s.add_argument("--train-years", type=int, default=4)
    s.add_argument("--test-years", type=int, default=1)
    s.add_argument("--objective", default="calmar")
    s.set_defaults(fn=cmd_walkforward)
    s = sub.add_parser("montecarlo", help="bootstrap distribution of one-year outcomes")
    add_bt(s)
    s.add_argument("--sims", type=int, default=5000)
    s.set_defaults(fn=cmd_montecarlo)
    s = sub.add_parser("signals", help="print today's indicator values and targets")
    s.set_defaults(fn=cmd_signals)
    s = sub.add_parser("run", help="one rebalance pass against the configured broker")
    s.add_argument("--live", action="store_true", help="actually send orders (default is dry run)")
    s.add_argument("--broker", choices=["paper", "alpaca"])
    s.add_argument("--force", action="store_true", help="run even if the market is closed")
    s.add_argument("--no-refresh", action="store_true")
    s.set_defaults(fn=cmd_run)
    s = sub.add_parser("status", help="show engine state and recent activity")
    s.add_argument("-n", type=int, default=10)
    s.set_defaults(fn=cmd_status)

    args = p.parse_args(argv)
    logging.basicConfig(level=logging.DEBUG if args.verbose else logging.WARNING, format="%(levelname)s %(name)s: %(message)s")
    cfg = load_config(args.config)
    return args.fn(cfg, args)


if __name__ == "__main__":
    sys.exit(main())
