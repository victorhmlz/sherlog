# MICROCAP ENGINE — DEVELOPMENT STATE

**Version:** 0.10.0

**Current phase:** PHASE 2 — DATA

**Current task:** TASK 09 — DATABASE

**Project status:** COMPLETED

## Completed

- TASK 09 — DATABASE (PHASE 1 → PHASE 2): decisions made together
  (this task was explicitly flagged DECISION REQUIRED, not decided
  unilaterally): **Drizzle ORM** + **Neon** (free tier, Postgres only)
  via the `neon-http` driver (Vercel-serverless-compatible, no
  connection pooling needed). New `lib/data/db/schema.js` — 5 tables
  (`tokens`, `market_snapshots`, `auction_data`, `signals`,
  `paper_trades`) translating `docs/ARCHITECTURE.md` §5's conceptual
  shapes into real Postgres, `numeric` for all price fields, indexed on
  `(token_id, timestamp)` throughout. New `lib/data/db/client.js` —
  lazy `getDb()`, never touches `DATABASE_URL` at import time, so its
  mere existence can't break the build; throws a clear setup error if
  the env var is missing. New `drizzle.config.js`, initial migration
  committed at `drizzle/0000_rich_jackpot.sql`, `.env.example`
  (`.gitignore` gained a `!.env.example` exception — was silently
  blocking it before), and `db:generate`/`db:push`/`db:studio` npm
  scripts. **Scope is infrastructure only** — no route or component
  reads/writes through this schema; dashboard/token-detail keep reading
  `mocks/tokens.js` exclusively, unaffected. `npm run lint`/`build`
  pass. `db:generate` verified fully offline (no live DB needed,
  produced correct SQL for all 5 tables/FKs/indexes); `db:push`
  verified to fail with a clear, expected error without `DATABASE_URL`;
  `getDb()` verified to throw its intended actionable error. No live
  Neon instance was reachable in this build environment (network
  egress restricted to package registries), so an actual `db:push`
  against a real database and any real query were NOT run end-to-end —
  **you'll need to run `npm run db:push` yourself** once `.env` has a
  real `DATABASE_URL` to actually create these tables.
- TASK 08 — SIGNAL ENGINE: new `lib/signal/signalEngine.js` —
  `computeSignal(token)`, the project's first real Signal Engine, per
  the conceptual `Signal` shape in `docs/ARCHITECTURE.md` §5.
  Reconciles the already-computed Score Engine (TASK 06) and Risk
  Engine (TASK 07) output: if `risk.overall` is HIGH, signal is forced
  to IGNORE regardless of score (concrete enforcement of "Score 90 +
  Risk HIGH = NO TRADE"); otherwise signal follows the score tier
  directly, escalating a SETUP A+ tier to EXTREME only when both
  volume and buyer acceleration are ≥ 3x. Also produces a
  `signalReason` explanation string. First engine needing zero
  authored seed — every input already has a real feature source.
  `mocks/tokens.js` fixtures no longer author a `signal` field at all
  (previously the last hand-authored token attribute); `mockTokens`
  computes it via `computeSignal` after score/risk. TASK 04's
  `tickToken` also recomputes signal live now, alongside score/risk.
  Small UI addition: `TokenDetailHeader.js` shows `signalReason` as a
  caption under the badges. No dependencies added. Verified:
  standalone script matched wired output exactly for all 10 tokens;
  `npm run lint`/`build` pass; dev-server HTML confirmed HLX renders
  "EXTREME" with its full momentum-based reason text.
- TASK 07 — RISK ENGINE: new `lib/risk/riskEngine.js` —
  `computeRisk(token)`, the project's first real Risk Engine, per
  `docs/ARCHITECTURE.md` §7. Fully independent of the Score Engine (no
  cross-reads either direction — a token can score high and still be
  flagged high risk, per architecture). Computes `liquidityStatus`
  (from `liquidity` + `liquidityTrend`) and `concentration` (from
  `top10Concentration`) from real feature fields; derives `exitStatus`
  directly from `liquidityStatus`; passes through `contractRisk` and
  `suspiciousWallets` unchanged (no bytecode-analysis or wallet-
  clustering adapter exists). New aggregate `overall` (LOW/MODERATE/
  HIGH) + `noTrade` boolean implements ARCHITECTURE.md §7's "Score 90 +
  Risk HIGH = NO TRADE" rule directly. `mocks/tokens.js` fixtures now
  seed only `{ contractRisk, suspiciousWallets }` per token; `mockTokens`
  maps every fixture through `computeRisk` (alongside TASK 06's
  `computeScore`). TASK 04's `tickToken` also recomputes risk live now.
  Small UI addition: `SelectedTokenPanel.js`'s RISK section header shows
  the new `overall` tier and a "· NO TRADE" marker when applicable. No
  dependencies added. Verified: computed `liquidityStatus`/
  `concentration` match the old hand-authored labels for 9 of 10 tokens
  (only NXA shifts HEALTHY→THIN); `npm run lint`/`build` pass;
  dev-server HTML confirmed MRBL renders "HIGH · NO TRADE".

- **Hotfix (post-TASK 06, pre-TASK 07):** fixed a hydration mismatch on
  `/dashboard`'s "Last update" timestamp, caused by
  `useMockLiveStream`'s initial state being computed from `new Date()`
  during both SSR and client hydration (two different moments). See
  CHANGELOG 0.7.1 for details. Version number not bumped for this —
  it's a correctness fix to existing TASK 04 code, not a new task.

- TASK 06 — SCORE ENGINE: new `lib/scoring/scoreEngine.js` —
  `computeScore(token)`, the project's first real Score Engine, per
  `docs/ARCHITECTURE.md` §6 (V1 weights, calibration deferred to
  TASK 21). Computes 6 of 8 components (auction, volume, buyers,
  pressure, liquidity, holders — 80/100 weight) from a token's actual
  feature fields; the other 2 (`fomo`, `price` — 20/100 weight) have no
  real feature source yet (no Long/Fomo/external adapter, TASK 16–18;
  no price-structure model), so they pass through an authored seed
  unchanged rather than being invented. `SCORE_COMPONENT_MAX/LABELS`,
  `SCORE_TIERS`, and `getScoreTier` moved here (canonical home);
  `mocks/tokens.js` re-exports them unchanged, so `ScoreBadge.js` and
  `MicrocapScorePanel.js` needed no changes. `mocks/tokens.js` fixtures
  now carry only a `scoreBreakdown: { fomo, price }` seed each — the
  exported `mockTokens` maps every fixture through `computeScore` to
  produce the real, explainable `score`/`scoreBreakdown`. TASK 04's
  `tickToken` now also calls `computeScore` after each tick, so the
  live dashboard's score/tier/sort-order genuinely track the mock
  stream (closing the gap TASK 04 explicitly deferred to this task).
  No dependencies added. Verified for all 10 tokens: `score` equals the
  exact sum of `scoreBreakdown`; `npm run lint`/`build` pass; dev-server
  HTML confirmed to show the engine's real computed values (e.g. NXA:
  82/100, "SETUP A", Long Auction 16/20 — not the old hand-authored
  91/100). Recomputed scores intentionally differ from the old
  hand-authored fixture numbers (narrative placeholders, not a
  regression) while roughly preserving relative ranking. Each token's
  `signal` field was left as-authored, independent of the new
  score/tier by the project's own established design (reconciling them
  is Signal Engine's job — TASK 08). Score Engine reads nothing from
  `token.risk` — stays independent of Risk Engine (TASK 07) per
  ARCHITECTURE.md §7.
- TASK 05 — CHARTS: added `recharts` (first charting dependency in the
  project). New `mocks/priceHistory.js:generatePriceHistory(token)`
  deterministically synthesizes an intraday price/volume series seeded
  from the token's id (never `Math.random`, so it's stable across
  renders and requests) — always ending exactly at that token's
  current `price`/`volume5m`. New `components/charts/PriceChart.js`
  (area) and `VolumeChart.js` (bar), with a shared dark-themed
  `ChartTooltip.js`. `/token/[id]` (TASK 03) gained a "PRICE"/"VOLUME
  (5M)" section between the selected-token panels and Signal History,
  captioned as simulated history since no persistence layer exists yet
  (TASK 09/10). Charts were NOT added to the dashboard table or to the
  Momentum/Long Auction/Score panels (those are bounded 0–100 `Meter`
  bars, not time series), and are NOT wired to the TASK 04 live stream
  — `/token/[id]` still renders a static per-request snapshot.
  `npm run lint`/`npm run build` pass; manually verified the generator
  respects `MIN_POINTS`/`MAX_POINTS` bounds, matches the token's
  current price/volume exactly, and is deterministic across repeated
  calls (no hydration-mismatch risk); dev server renders both charts
  with no errors.
- TASK 04 — REALTIME MOCK STREAM: new `lib/realtime/mockStream.js`
  (pure `tickToken`/`tickTokens`, framework-free) and
  `lib/realtime/useMockLiveStream.js` (client hook wrapping a 4s
  `setInterval`) simulate a live feed on top of the same
  `mocks/tokens.js` fixtures — still no WebSocket/SSE connection
  (mechanism remains DECISION REQUIRED, see `docs/ARCHITECTURE.md`
  §8). New `components/dashboard/LiveDashboard.js` (client) owns the
  stream and now backs `/dashboard`: the opportunities table,
  selected-token panels, and the header's `LiveIndicator`/"Last
  update" timestamp all tick live. `DashboardHeader` takes
  `lastUpdate`/`active` as props now (defaulting to the old static
  fixture/`true`). Only price, market cap, liquidity (+ derived
  `liquidityTrend`), 5m/30m volume, buy pressure,
  volume/buyer acceleration, unique buyers, and age tick — `score`,
  `scoreBreakdown`, `risk`, `holders`/`top10Concentration`, and
  `auction` are untouched (those belong to TASK 06/07/14/16-17).
  Global metric cards, Market Status, Signal History, and `/token/[id]`
  (TASK 03) remain static — no well-defined live derivation for them
  yet. `npm run lint`/`npm run build` pass; server-side render
  verified error-free with a correctly advancing `HH:MM:SS` timestamp;
  the actual post-hydration client-side ticking was not verified in a
  real browser (none available in this environment).
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

- You still need to run `npm run db:push` against your real Neon
  `DATABASE_URL` to actually create the TASK 09 tables — the schema
  and migration exist in the repo, but were never applied to a live
  database from this build environment (see TASK 09's Verification
  notes above). Nothing else beyond TASK 09 scope is in progress.

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
  recharts: ^3.10
  drizzle-orm: ^0.45
  @neondatabase/serverless: ^1.1

devDependencies:
  @tailwindcss/postcss: ^4
  eslint: ^9
  eslint-config-next: 16.3.4
  tailwindcss: ^4
  drizzle-kit: ^0.31
  dotenv: ^17
```

`recharts` was added in TASK 05 for the token detail page's price/
volume charts. `drizzle-orm`/`@neondatabase/serverless` (runtime) and
`drizzle-kit`/`dotenv` (dev, CLI-only) were added in TASK 09 for the
database schema/client — see that task's CHANGELOG entry for the
Drizzle-vs-Prisma-vs-Kysely and Neon-vs-Supabase-vs-Docker decisions.
No WebSocket library has been installed yet — will be added only when
a concrete task needs it.

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
- TASK 01–08 (Phase 1) are UI/engine-only in the sense that no real
  data source exists. TASK 06's Score Engine, TASK 07's Risk Engine,
  and TASK 08's Signal Engine are real, deterministic logic — not mock
  data — but Score/Risk each still pass 2 of their inputs through an
  authored seed (`fomo`/`price` for score; `contractRisk`/
  `suspiciousWallets` for risk) because no adapter or on-chain analysis
  exists for those yet; Signal needs no seed at all. The "realtime"
  stream (TASK 04) is a client-side `setInterval` simulation; the
  price/volume charts (TASK 05) read a deterministically generated mock
  series. TASK 09's database schema (`lib/data/db/`) is real
  infrastructure, but nothing reads or writes through it yet — the
  dashboard/token-detail pages still read `mocks/tokens.js` exclusively
  and remain completely unaffected. There is still no blockchain/RPC
  integration, Long/Fomo integration, real WebSocket/SSE connection,
  wallet connection, or trading execution of any kind. Auction data,
  holders, and top-10 concentration remain static mock fixtures
  throughout (holder-analysis is TASK 14).

## Next task

TASK 10 — HISTORICAL SNAPSHOTS (not started; do not proceed
automatically). This is the task that starts actually writing to the
TASK 09 schema — requires `DATABASE_URL` to be set to a real,
`db:push`-ed Neon database first.
