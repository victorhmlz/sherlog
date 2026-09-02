# MICROCAP ENGINE — DEVELOPMENT STATE

**Version:** 0.4.0

**Current phase:** PHASE 1 — UI / MOCK ENGINE

**Current task:** TASK 03 — TOKEN DETAIL

**Project status:** COMPLETED

## Completed

- TASK 03 — TOKEN DETAIL: new full-page route `/token/[id]`
  (`app/(app)/token/[id]/page.js`) giving each mock token its own
  shareable URL. Reuses the four TASK 02 selected-token panels
  (`SelectedTokenPanel`, `MomentumPanel`, `LongAuctionPanel`,
  `MicrocapScorePanel`) unmodified, plus a token-scoped `SignalHistory`
  filtered by symbol, under a new `TokenDetailHeader` (back link,
  identity, price, score, signal). An unmatched id renders the new
  `TokenNotFound` component instead of a crash or Next's default 404.
  `SignalHistory` gained optional `title`/`emptyMessage` props (with
  backward-compatible defaults) to support this reuse.
  `OpportunitiesTable` rows now link their symbol to `/token/{id}`
  (`stopPropagation` preserves TASK 02's row-click selection). No
  charts, realtime data, Score Engine, or Risk Engine logic was added —
  still 100% static mock data from `mocks/tokens.js` (TASK 04–07
  remain untouched).
- TASK 02 — DASHBOARD: `/dashboard` evolved from the TASK 01 UI
  foundation into the operational Microcap Engine dashboard. All data
  remains mock; the mock-data architecture (`mocks/tokens.js` as the
  single source of truth, read by presentation components) is retained
  and extended rather than replaced.
- Mock data model extended per token (see `mocks/tokens.js`): chain,
  age, volume30m, holders, top10Concentration, volumeAcceleration,
  buyerAcceleration, uniqueBuyers, liquidityTrend, a mock Long auction
  snapshot (status/actual/expected/efficiency/price), an independent
  risk block (liquidityStatus/concentration/contractRisk/exitStatus/
  suspiciousWallets), and a scoreBreakdown across 8 components that
  sums exactly to each token's total score. Added `mockSignalHistory`,
  `CHAINS`, `AUCTION_STATUSES`, `SCORE_COMPONENT_MAX`,
  `SCORE_COMPONENT_LABELS`. Component weights mirror the conceptual
  weighting in `docs/ARCHITECTURE.md` §6 (Narrative/Social folded into
  Fomo) — no actual Score Engine exists (TASK 06 remains untouched).
- Dashboard information architecture (per TASK 02 spec): Header →
  global metrics → Market Status → Opportunities (with filters) +
  Selected Token detail (Token Metrics, Momentum, Long Auction,
  Microcap Score) → Signal History.
- `DashboardHeader`: now shows a "MOCK DATA" badge and the count of
  monitored opportunities, alongside the existing LIVE indicator and
  last-update timestamp.
- `MarketOverview`: reworked into a full-width horizontal status strip
  (previously a narrow sidebar card) to fit the new top-level section
  layout.
- `OpportunitiesTable`: now a controlled/presentational component (no
  internal state) — sorting and filtering happen in the parent.
  Columns extended to TOKEN, CHAIN, AGE, PRICE, MC, LIQUIDITY, VOL 5M,
  BUY %, VOL ACCEL, SCORE, SIGNAL; sorted by score descending; selected
  row shows an accent marker in addition to the background highlight
  (never color alone).
- New `OpportunityFilters` component: Chain, Signal, minimum Score, and
  Auction status filters plus a Reset button. Pure controlled inputs,
  local React state only, no state-management library, no backend.
- New `DashboardWorkspace` (client component): owns filter state and
  selected-token state, composing `OpportunityFilters`,
  `OpportunitiesTable`, and the four selected-token panels so
  selection/filtering stay in sync. The first token by score is
  selected by default.
- New `SelectedTokenPanel`: symbol/chain/age/price header, a metrics
  grid (market cap, liquidity, volume 30m, holders, top-10
  concentration, buy pressure, volume/buyer acceleration), and a
  compact independent RISK section (liquidity/concentration/contract/
  exit status, suspicious wallet count) — risk is presented as-is from
  mock data, no Risk Engine logic (TASK 07 remains untouched).
- New `MomentumPanel`: volume acceleration, buyer acceleration, and buy
  pressure as bar meters, plus unique buyers and liquidity trend —
  separating raw price movement from underlying demand acceleration
  per `docs/ARCHITECTURE.md`'s explainability principle.
- New `LongAuctionPanel`: actual vs. expected progress bars, an
  efficiency figure, and the simulated auction price. Purely a UI
  representation of mock `auction` data — no Long adapter, no
  scraping, no API (TASK 16–17 remain untouched). Handles the `NONE`
  auction-status case with a plain "no auction data" state.
- New `MicrocapScorePanel`: total score, tier label, and the full
  8-component breakdown as bar meters, so "why is this token X/100" is
  always answerable from the UI — no scoring algorithm implemented.
- New `SignalHistory`: static list from `mockSignalHistory` (time,
  token, score, signal badge, outcome) — no persistence, no real
  backtested performance (TASK 19–21 remain untouched).
- New shared `ui/Meter` component: a CSS-only horizontal bar meter used
  by Momentum, Long Auction, and Microcap Score panels. No charting
  library was added (TASK 05 remains untouched); values are always
  shown as text alongside the bar.
- `components/ui/format.js` extended with `formatAge`,
  `formatMultiplier`, and `formatCount` helpers.
- `npm run lint` and `npm run build` verified passing after every
  change; all 7 section routes plus `/` and `/_not-found` compile and
  prerender as static content.
- `npm run dev` verified manually: `/dashboard` and all six other
  section routes return HTTP 200 with no server-side errors in the dev
  log; dashboard HTML confirmed to contain every new section (MOCK
  DATA badge, MARKET STATUS, TOP OPPORTUNITIES, SELECTED TOKEN,
  MOMENTUM, LONG AUCTION, MICROCAP SCORE, SIGNAL HISTORY, filter
  controls). Responsive structure verified by inspecting rendered
  classes: the opportunities table scrolls horizontally inside its own
  `overflow-x-auto` container (not the page), and all grids collapse
  to a single column below `lg`/`xl` breakpoints.
- No dependencies added. No files outside `app/(app)/dashboard/`,
  `components/dashboard/`, `components/ui/`, `mocks/tokens.js`, and
  `docs/` were modified; the six other section routes
  (scanner/signals/watchlist/analytics/paper-trading/settings) were
  not touched.

## In progress

- Nothing beyond TASK 03 scope is in progress.

## Known issues

- Next.js 16.x may contain conventions/breaking changes not reflected
  in older training data. NOT VERIFIED against the full upstream
  changelog; future sessions should consult
  `node_modules/next/dist/docs/` before writing App Router code that
  relies on memorized (possibly outdated) Next.js behavior.
- No real project existed prior to this task, so there is no legacy
  code, no mock data, and no existing adapters to carry forward. This
  is a clean-slate foundation, not a migrated/audited legacy codebase.

## Architectural decisions

- App Router (not Pages Router) — DECISION: default for new Next.js
  projects per section 21 constraints (no framework changes allowed).
- JavaScript (not TypeScript) — DECISION REQUIRED was avoided by
  following section 21's explicit instruction not to introduce
  TypeScript.
- Tailwind CSS v4 — used because `create-next-app` current default
  installs v4; compatible with stated stack preference for Tailwind.
- Database engine: PostgreSQL is the target per project spec, but
  **no schema, ORM, or connection has been created** — DECISION
  REQUIRED in TASK 09 (choice of driver/ORM, e.g. `pg` vs. Prisma vs.
  Drizzle, is not yet made).
- Realtime mechanism (WebSockets vs. SSE): DECISION REQUIRED in a
  later task — not chosen yet, no implementation exists.
- All external data adapters (Long, EVM, authorized external APIs):
  interfaces only, to be created starting TASK 12/16/18. Nothing is
  invented; each will carry `// TODO: API integration pending` until
  a real, documented API is available.

## Dependencies

```
dependencies:
  next: 16.3.4
  react: 19.2.8
  react-dom: 19.2.8

devDependencies:
  @tailwindcss/postcss: ^4
  eslint: ^9
  eslint-config-next: 16.3.4
  tailwindcss: ^4
```

No additional dependencies were added beyond the `create-next-app`
defaults. No database client, charting library, or WebSocket library
has been installed yet — these will be added only when a concrete task
needs them (per project rule: don't install "just in case").

## Environment

No `.env` file exists yet (no secrets, no live data sources). A
`.env.example` was created as an empty placeholder for future
variables (e.g. `DATABASE_URL`, `RPC_URL`, adapter API keys) — to be
filled in when those integrations are actually built.

## Important warnings

- No real trading, wallet connection, private keys, seed phrases, or
  automated execution exists anywhere in this project. This must
  remain true until an explicit, separate future decision changes
  project scope.
- No Long/Fomo scraping or unauthorized integration exists or should
  be added.
- This is a greenfield scaffold, not an audited legacy system — future
  sessions should not assume any business logic, data model, or API
  integration exists beyond what is listed under "Completed" above.
- TASK 01, TASK 02, and TASK 03 are UI-only. There is still no Score
  Engine, Risk Engine, database, blockchain/RPC integration, Long/Fomo
  integration, WebSocket/SSE realtime stream, wallet connection, or
  trading execution of any kind. All dashboard and token-detail values
  (including the score breakdown, auction data, and risk attributes)
  are static mock fixtures from `mocks/tokens.js`.

## Next task

TASK 04 — REALTIME MOCK STREAM (not started; do not proceed
automatically).
