"""Fortress: a rules-based, risk-first daily trading bot.

Design goals, in priority order:
1. Never blow up (vol targeting, drawdown guard, daily kill switch, no leverage by default).
2. Maximise the share of calendar days that are not net losers (be flat when there is no edge,
   size down when volatility is high, diversify across uncorrelated sleeves).
3. Capture the two most robust, most-replicated return sources in liquid markets:
   long-term trend (time-series momentum) and short-term mean reversion inside an uptrend.
"""

__version__ = "1.0.0"
