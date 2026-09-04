# MICROCAP ENGINE — ROADMAP

```text
PHASE 0 — FOUNDATION
TASK 00 — AUDIT + INITIALIZATION            [COMPLETED]

PHASE 1 — UI / MOCK ENGINE
TASK 01 — UI FOUNDATION
TASK 02 — DASHBOARD
TASK 03 — TOKEN DETAIL
TASK 04 — REALTIME MOCK STREAM
TASK 05 — CHARTS
TASK 06 — SCORE ENGINE
TASK 07 — RISK ENGINE
TASK 08 — SIGNAL ENGINE

PHASE 2 — DATA
TASK 09 — DATABASE
TASK 10 — HISTORICAL SNAPSHOTS
TASK 11 — ANALYTICS

PHASE 3 — ON-CHAIN
TASK 12 — EVM ADAPTER
TASK 13 — SWAP INDEXING
TASK 14 — HOLDER ANALYSIS
TASK 15 — LIQUIDITY ANALYSIS

PHASE 4 — LONG
TASK 16 — LONG ADAPTER
TASK 17 — LONG AUCTION ENGINE

PHASE 5 — EXTERNAL SIGNALS
TASK 18 — AUTHORIZED DATA INTEGRATION

PHASE 6 — PAPER TRADING
TASK 19 — PAPER TRADING ENGINE
TASK 20 — BACKTESTING
TASK 21 — CALIBRATION

PHASE 7 — PRODUCTION
TASK 22 — HARDENING
```

## Notes

- No task automatically triggers the next. Each task should be
  explicitly requested.
- PHASE 6 (paper trading) simulates trades only; no phase in this
  roadmap includes real trade execution, wallet key handling, or
  automated buying/selling. Any future request to add real execution
  is a distinct, separate decision outside this roadmap's scope.
- TASK 09 (DATABASE) was the first point at which a concrete
  PostgreSQL schema and driver/ORM choice had to be made — RESOLVED:
  Drizzle ORM + Neon (free tier), see docs/CHANGELOG.md's 0.10.0 entry
  for the decision rationale.
- TASK 12 and TASK 16 must not scrape data; only documented/authorized
  APIs and RPC endpoints are permitted.
