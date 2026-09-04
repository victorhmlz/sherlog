# SHERLOG — ARCHITECTURE

## 1. Objective

MICROCAP ENGINE is a **Real-Time Microcap Intelligence Terminal**: a web
application for detecting early acceleration of volume, buyers, liquidity,
and market activity in emerging tokens.

The system is explicitly scoped as:

```
DATA → ANALYSIS → SIGNAL → PAPER TRADING
```

and NOT:

```
DATA → AUTOMATIC TRADE
```

No real trading, wallet execution, private keys, or automated
buying/selling is implemented at any phase covered by this document.
The system must remain **explainable**: every score must be traceable to
its component signals (e.g. "Score 83/100 because: Volume acceleration
3.2x, Buyer acceleration 2.1x, ...").

## 2. Stack (as of TASK 00)

| Layer      | Technology                          | Notes |
|------------|--------------------------------------|-------|
| Frontend   | Next.js 16.3.4 (App Router), React 19.2.8, JavaScript | Scaffolded fresh in TASK 00; no prior project existed |
| Styling    | Tailwind CSS v4                     | via `@tailwindcss/postcss` |
| Linting    | ESLint 9 + `eslint-config-next`     | |
| Backend    | Node.js 22.x, Next.js route handlers (`app/api/`) | Server functions/workers to be added as needed |
| Database   | PostgreSQL (Neon), Drizzle ORM      | Schema + client added in TASK 09 (`lib/data/db/`) — no route reads/writes through it yet, see TASK 10 |
| Realtime   | WebSockets / SSE                     | **NOT YET IMPLEMENTED** |
| Blockchain | EVM-compatible, RPC / WS-RPC        | Read-only RPC client added in TASK 12 (`lib/chain/`) — identity reads only (name/symbol/decimals/totalSupply); price/liquidity/volume/holders need TASK 13–15 |
| Data sources | Long, on-chain data, authorized external APIs | **NOT YET IMPLEMENTED** — adapters are interfaces only, TODO |

> NOTE: This project was scaffolded from scratch in TASK 00 (no pre-existing
> codebase was provided to audit). All "not yet implemented" items above
> are intentional per TASK 00 scope, not omissions.

> NOTE: This Next.js version (16.x) may include breaking changes relative
> to older training data. Future sessions should consult
> `node_modules/next/dist/docs/` before relying on memorized Next.js
> conventions. NOT VERIFIED against final production Next.js docs.

## 3. Frontend / Backend Separation

- `app/` — routes only (App Router). Pages compose components and call
  `lib/` for logic; pages must not contain scoring/risk/data-fetching
  business logic directly.
- `app/api/` — Next.js route handlers, the only place external requests
  enter the server-side data pipeline.
- `components/` — presentational + container UI components, grouped by
  domain (dashboard, tokens, charts, signals) plus a shared `ui/` kit.
- `lib/` — all business logic, isolated from React:
  - `lib/adapters/` — one adapter per external data source (see §4).
  - `lib/data/` — normalization, caching, repository-style access.
  - `lib/market/` — market snapshot utilities.
  - `lib/scoring/` — Score Engine (§6).
  - `lib/risk/` — Risk Engine (§7), independent of scoring.
  - `lib/utils/` — generic helpers.
- `mocks/` — mock data fixtures used until real adapters exist.

## 4. Adapter Pattern (Data Source Isolation)

External providers must never leak into the UI or into each other. All
external data flows through a one-way pipeline:

```
Data Source
     ↓
Adapter
     ↓
Normalized Data Model
     ↓
Scoring Engine
     ↓
UI
```

Concrete examples (future tasks):

```
Long                 → LongAdapter        → NormalizedTokenData → ScoreEngine
On-chain (EVM)        → EVMAdapter         → NormalizedTokenData
Authorized ext. API   → ExternalDataAdapter→ NormalizedTokenData
```

Rules:
- The UI never imports a provider SDK or calls a provider URL directly.
- Every adapter implements the same interface and returns the same
  `NormalizedTokenData` shape regardless of source.
- Undocumented/unavailable APIs are represented as an abstract
  adapter interface with `// TODO: API integration pending` — never
  invented.

## 5. Conceptual Data Model

These conceptual shapes were implemented as real PostgreSQL tables via
Drizzle ORM in TASK 09 — see `lib/data/db/schema.js` for the actual
column types/constraints/indexes, and `docs/CHANGELOG.md`'s 0.10.0
entry for the specific translation decisions (e.g. `numeric` for all
price-like fields, `momentumScore` collapsing `volume`+`buyers`). No
route or component reads/writes through this schema yet — the schema
existing is TASK 09's entire scope; wiring it up is TASK 10 —
HISTORICAL SNAPSHOTS.

```js
// Token
{ address, chainId, symbol, name, createdAt, updatedAt }

// MarketSnapshot
{
  token, timestamp,
  price, marketCap, liquidity,
  volume5m, volume15m, volume30m,
  buys5m, sells5m,
  uniqueBuyers5m, uniqueSellers5m,
  buyPressure,
  holders,
  top1Pct, top5Pct, top10Pct
}

// AuctionData
{ token, timestamp, auctionProgress, expectedProgress, auctionEfficiency, price, tokensSold }

// Signal
{
  token, timestamp,
  score, setup,
  momentumScore, liquidityScore, holderScore, auctionScore, externalSignalScore,
  reason
}

// PaperTrade
{
  token,
  entryTime, entryPrice,
  exitTime, exitPrice,
  positionSize,
  pnl, pnlPercent,
  maxDrawdown, maxRunup,
  entryScore, exitReason
}
```

## 6. Score Engine (V1 weights — NOT final)

```
Long Auction             20
Volume Momentum          15
Buyer Momentum           15
Buy Pressure             10
Liquidity                10
Holder Distribution      10
Price Structure           5
External/FOMO Signal     10
Narrative/Social           5
                        ----
                         100
```

Output is `0–100` and must always be explainable: each component's raw
value and contribution should be retrievable, not just the final number.
These weights are placeholders pending real data calibration
(TASK 21 — CALIBRATION).

## 7. Risk Engine (independent of Score Engine)

The Risk Engine is a **separate** evaluation, not a component of the
Score Engine. A token can have `Score = 90` and `Risk = HIGH`, which
means `NO TRADE` regardless of score. Future inputs:

- liquidity, slippage
- holder concentration, creator concentration
- suspicious wallets, liquidity removal
- abnormal sell pressure, volume collapse
- contract risk, exit feasibility

Combined future output example:

```
MICROCAP SCORE: 84/100
RISK: MEDIUM
SIGNAL: SETUP A
```

"Has momentum" and "is safe" must never be conflated.

## 8. Realtime (future)

WebSockets or Server-Sent Events (mechanism TBD — DECISION REQUIRED) will
stream `MarketSnapshot` updates to the dashboard. Not implemented in
TASK 00.

## 9. Blockchain / Long / External Integrations (future)

- EVM adapter: RPC + WS-RPC, on-chain swap/holder indexing.
  Read-only RPC client + ERC-20 identity reads implemented in TASK 12
  (`lib/chain/`) — viem, public RPC endpoints (no provider signup;
  `RPC_URL_<CHAIN>` env vars can override per chain). Uniswap V2-style
  swap-log indexing (real buy/sell/volume figures for a known pool
  address) implemented in TASK 13 (`lib/chain/swaps.js`) — V3 pools,
  pool discovery, and USD conversion are explicitly out of scope there.
  Holder analysis and liquidity/price (pool) discovery are NOT
  implemented — TASK 14–15.
- Long adapter: auction data (progress, expected progress, efficiency).
  Not implemented — TASK 16–17. No scraping; only documented/authorized
  APIs.
- Authorized external signals: abstract adapter only. Not implemented —
  TASK 18.

## 10. Paper Trading & Analytics (future)

Paper trading engine will simulate entries/exits against
`NormalizedTokenData` and `Signal` history to compute expectancy, win
rate, average win/loss, drawdown, and profit factor. No real capital,
no real execution. Not implemented — TASK 19–21.

## 11. Directory Diagram

```text
MICROCAP ENGINE
│
├── app/
│   ├── dashboard/
│   ├── tokens/
│   ├── signals/
│   ├── analytics/
│   └── api/
│
├── components/
│   ├── dashboard/
│   ├── tokens/
│   ├── charts/
│   ├── signals/
│   └── ui/
│
├── lib/
│   ├── scoring/
│   ├── risk/
│   ├── market/
│   ├── data/
│   ├── adapters/
│   └── utils/
│
├── mocks/
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   ├── MICROCAP_ENGINE_STATE.md
│   └── CHANGELOG.md
│
└── public/
```

All directories above exist as of TASK 00 (empty, with `.gitkeep`
placeholders) except their eventual contents, which are out of scope
for this task.
