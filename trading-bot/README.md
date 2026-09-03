# Fortress trading bot

A rules-based, risk-first daily trading bot. It trades broad index ETFs (SPY and QQQ by default) with the
two most-replicated return sources in liquid markets, wrapped in a risk layer whose only job is to keep
loss days rare and small. It ships with a conservative backtester, walk-forward and bootstrap validation,
a local paper broker, and an Alpaca adapter for paper or live trading.

**What it will and will not do.** Over 1986-2026 the bot compounds at roughly 6-7% a year with ~7%
volatility and a worst calendar year of about -5%, against the Nasdaq-100's 14% a year with 26% volatility,
an 83% peak-to-trough drawdown and a -42% worst year. It gives up most of the upside to remove nearly all of
the downside. No strategy can guarantee profit, and every number below comes from a backtest, not a live
track record. Read the caveats section before trading real money.

## How it works

Every trading day, shortly before the close, for each asset:

1. **Trend sleeve (70% of the sleeve budget).** Long while the close is above its 200-day moving average,
   flat otherwise. Time-series momentum is documented across every asset class and century of data
   (Faber 2007; Moskowitz, Ooi and Pedersen 2012). It rarely wins more days than buy-and-hold, but almost
   every catastrophic month in equities happened with price below the 200-day average, and this sleeve
   simply is not there for them.
2. **Pullback sleeve (30%).** Inside an uptrend only, buy a 2-day RSI washout (RSI(2) < 10 or three
   straight down closes) and sell when RSI(2) > 65, the close is back above its 5-day average, the trend
   breaks, or 10 days elapse. Connors-style short-term mean reversion is the single highest per-trade hit
   rate entry in daily index data, and it is uncorrelated day-to-day with the trend sleeve. Together the
   two sleeves bring exposure to 100% exactly when the next-day odds are best.
3. **Volatility targeting.** Exposure is multiplied by `12% / max(realised 20-day vol, VIX)` and capped at
   1.0 (no leverage). Large loss days cluster in high-vol regimes; shrinking there removes most days worse
   than -2% at little cost (Moreira and Muir 2017).
4. **Drawdown guard.** If the bot's own equity is 8% below its high-water mark exposure is halved; below
   15% it is cut to a quarter; it is restored once within 4% of the peak.
5. **Gross cap, rebalance band, execution.** Total exposure is capped at 100% of equity, orders only go out
   when the target differs from the holding by more than 5% of equity (full exits always go out), and
   fills are modelled at the next close paying 5 bp per side.
6. **Daily kill switch (live only).** If account equity falls more than 2% below the start-of-day mark,
   everything is flattened and the bot refuses to re-enter until the next day.
7. **Cash is a position.** Idle cash earns the 3-month T-bill rate in the backtest, as it does at any
   modern broker, so flat days are slightly positive days.

## Results

All runs use key-free FRED data (S&P 500 and Nasdaq-100 *price* indices, VIX, 3-month T-bills), signals on
close *t* executed at close *t+1*, 5 bp per side, cash earning T-bills. Reproduce with the commands in the
next section. Buy-and-hold uses the same allocation.

### Default universe, 50% SPY / 50% QQQ, Sep 2016 - Sep 2026

| | Bot | Buy and hold |
|---|---|---|
| CAGR | 7.4% | 16.7% |
| Annualised volatility | 6.7% | 20.1% |
| Sharpe (over T-bills) | 0.74 | 0.75 |
| Max drawdown | -7.6% | -31.0% |
| Days with a loss | 37.0% | 43.9% |
| Days worse than -1% | 2.0% | 13.5% |
| Days worse than -2% | 0.2% | 4.5% |
| Worst day | -3.3% | -12.1% |
| Worst month | -5.1% | -11.1% |
| Worst calendar year | -4.5% (2022) | -26.4% (2022) |
| Positive calendar years | 10 of 11 | 9 of 11 |
| Time in market | 85% | 100% |

### Long history, Nasdaq-100 only, Jan 1986 - Sep 2026 (includes 1987, 2000-02, 2008, 2020, 2022)

| | Bot | Buy and hold |
|---|---|---|
| CAGR | 6.3% | 14.2% |
| Annualised volatility | 7.3% | 26.1% |
| Sharpe (over T-bills) | 0.44 | 0.52 |
| Max drawdown | -15.8% (Oct 1987; -9.7% with same-close execution) | -82.9% |
| Days with a loss | 33.5% | 45.3% |
| Days worse than -1% | 2.5% | 19.1% |
| Days worse than -2% | 0.3% | 8.2% |
| Worst calendar year | -4.7% | -41.9% |
| Positive calendar years | 73% | 83% |
| 2000, 2001, 2002 | +0.9%, +0.6%, +1.6% | -37%, -33%, -38% |
| 2008 | -3.9% | -41.9% |

### Robustness checks (Nasdaq-100, 1986-2026)

* **Parameter sensitivity.** Every one of the 27 combinations of SMA length {150, 200, 250}, RSI entry
  {5, 10, 15} and vol target {10%, 12%, 15%} is profitable on both histories. Lowest Sharpe in the grid is
  0.41 (40 years) and 0.53 (10 years); the worst drawdown in the grid is -16%.
* **Walk-forward.** Re-choosing parameters each year on the prior four years only, then trading the next
  year, gives 36 out-of-sample years (1990-2026) at 6.5% CAGR, 6.6% vol, Sharpe 0.58, max drawdown -11.3%,
  worst year -4.4%, 81% of years positive.
* **Block-bootstrap Monte Carlo** (5,000 resampled years of the bot's daily returns):

  | | Bot | Buy and hold |
  |---|---|---|
  | P(losing year) | 19.5% | 28.0% |
  | P(year worse than -10%) | 1.8% | 16.3% |
  | P(drawdown worse than -20%) | 0.4% | 44.8% |
  | 5th-percentile year | -6.2% | -25.1% |

  On the 2016-2026 sample the same statistics are 13% / 0.6% / 0.0% / -3.4% for the bot.

### Where the loss-day reduction comes from

Being in cash roughly a quarter of the time removes those days from the loss count entirely (and T-bills
make them slightly positive). Vol targeting does not change *whether* a day loses, only *how much*: it is
what turns 13.5% of days worse than -1% into 2%. The pullback sleeve raises the hit rate on the days it is
active. Loss days *while exposed* still run about 43%, close to the market's base rate; nothing in daily-bar
index trading changes that number much, and any claim to the contrary should be treated with suspicion.

## Install and run

```bash
cd trading-bot
pip install -r requirements.txt

# validation on key-free data (works anywhere FRED is reachable)
python -m tradingbot --config configs/validation-fred-10y.yaml backtest
python -m tradingbot --config configs/validation-fred-40y.yaml backtest --lag 0   # same-close execution
python -m tradingbot --config configs/validation-fred-40y.yaml sensitivity
python -m tradingbot --config configs/validation-fred-40y.yaml walkforward
python -m tradingbot --config configs/validation-fred-40y.yaml montecarlo

# default config: Yahoo (dividend-adjusted SPY/QQQ) -> Stooq -> Alpaca -> FRED fallback chain
python -m tradingbot backtest --out results/
python -m tradingbot signals          # today's indicator values and pre-guard targets
python -m tradingbot run              # dry run against the local paper broker
python -m tradingbot run --live       # paper broker, orders recorded in data/paper_broker.json
python -m tradingbot status
python -m pytest -q tests
```

### Trading through Alpaca

```bash
export ALPACA_API_KEY=... ALPACA_SECRET_KEY=... ALPACA_PAPER=true   # paper account first, always
python -m tradingbot run --broker alpaca            # dry run: prints the orders it would send
python -m tradingbot run --broker alpaca --live     # sends notional market orders
```

Schedule `run_daily.sh --live` for about 15:50 ET on weekdays (crontab example inside the script), or use
`.github/workflows/trading-bot.yml` (manual trigger by default; uncomment the schedule to automate). The bot
is idempotent within a day: re-running it only trades if targets moved more than the rebalance band, and
after a kill switch it stays flat until the next day. State lives in `data/state/`, the trade log in
`data/state/activity.jsonl`.

## Configuration

`config.yaml` overrides `tradingbot/config.py` defaults. The useful knobs:

| Key | Default | Effect |
|---|---|---|
| `universe[].allocation` | 0.5 / 0.5 | Capital split. Optional `BTC/USD` sleeve is commented out; vol targeting shrinks it automatically. |
| `strategy.trend.weight` | 0.7 | Base exposure in an uptrend. |
| `strategy.mean_reversion.bull_weight` | 0.3 | Extra exposure on a washout. Trend + pullback = 1.0. |
| `strategy.mean_reversion.bear_weight` | 0.0 | Set to 0.2-0.3 to also buy washouts in downtrends (more return, more loss days). |
| `risk.target_vol` | 0.12 | 0.10 for fewer and smaller loss days, 0.15 for more return. |
| `risk.use_implied_vol` | true | Use VIX as a floor on the vol estimate. Turning it off adds ~0.5%/yr and some tail. |
| `risk.drawdown_soft/hard` | 0.08 / 0.15 | Guard thresholds. |
| `risk.max_daily_loss_pct` | 0.02 | Live kill switch. |
| `backtest.execution_lag` | 1 | 0 models market-on-close execution from a 15:50 signal. |
| `backtest.cost_bps` | 5 | Per side. Doubling it costs ~0.3%/yr. |

## Layout

```
tradingbot/
  data/providers.py   Yahoo, Stooq, FRED, Coinbase, Alpaca, CSV loaders; DataHub fallback chain + cache
  indicators.py       SMA, RSI, realised vol, ATR, drawdown (all causal; tested for lookahead)
  strategies.py       TrendFollowing, MeanReversion, Ensemble, build_ensemble(config)
  risk.py             RiskConfig, vol_scale, DrawdownGuard, cap_gross
  pipeline.py         compute_targets: the one signal path shared by backtest and live engine
  backtest.py         sequential daily simulator with lag, costs, rebalance band, cash yield
  metrics.py          CAGR, Sharpe, drawdown, loss-day statistics, yearly tables
  walkforward.py      sensitivity grid, walk-forward selection, block bootstrap
  broker.py           PaperBroker (JSON ledger), AlpacaBroker (REST)
  engine.py           daily loop: kill switch -> signals -> guard -> orders -> log
  cli.py              backtest | sensitivity | walkforward | montecarlo | signals | run | status
configs/              key-free validation configs
tests/                25 tests: indicators, no-lookahead, strategies, risk, backtest accounting, broker, engine
```

## Caveats, honestly

* **Price indices, not total return.** FRED's S&P 500 and Nasdaq-100 series exclude dividends, so both the
  bot and buy-and-hold are understated by roughly 1-2% a year times exposure. Yahoo data (the default
  source outside this sandbox) is dividend-adjusted.
* **The bot earns less than buy-and-hold in bull markets.** That is the design, not a bug. It targets the
  probability and size of loss days, and the price is upside. If you want more return, raise
  `target_vol` and accept more and bigger red days.
* **Part of the return is the T-bill yield.** In 2023-2026 that was 4-5% on the cash portion.
* **One-day crashes cannot be sidestepped with daily bars.** The -8.7% day in the long backtest is
  19 October 1987 with next-close execution; the live kill switch would have cut it but at a bad fill.
* **Backtests overstate.** Costs, gaps, partial fills and data errors are all worse in production. Run the
  paper broker for months before going live, start small, and compare live fills with the backtest.
* **Nothing here is investment advice.**
