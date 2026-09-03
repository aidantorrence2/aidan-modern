#!/usr/bin/env bash
# Daily rebalance. Schedule it a few minutes before the US close, e.g. in crontab (server in UTC):
#   50 19 * * 1-5  /path/to/trading-bot/run_daily.sh >> /path/to/trading-bot/data/cron.log 2>&1   # 15:50 ET during EDT
#   50 20 * * 1-5  ...                                                                              # 15:50 ET during EST
# Set ALPACA_API_KEY / ALPACA_SECRET_KEY / ALPACA_PAPER in the environment (or a .env file next to this script).
set -euo pipefail
cd "$(dirname "$0")"
[ -f .env ] && set -a && . ./.env && set +a
MODE="${1:-}"   # pass --live to send orders; anything else is a dry run
python3 -m tradingbot run --broker "${BROKER:-paper}" ${MODE}
