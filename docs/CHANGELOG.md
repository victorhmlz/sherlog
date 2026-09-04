# CHANGELOG

## 0.13.1 — Hotfix (floating-point noise in Age display)

### Fixed
- `components/ui/format.js:formatAge` — the sub-60-minutes branch
  interpolated the raw `minutes` value with no rounding
  (`` `${minutes}m` ``), unlike the hour/day branches which already
  used `Math.round`. Found live on the dashboard (screenshot from the
  project owner): ages rendering as e.g. "6.399999999999995m" instead
  of "6m". Root cause: TASK 04's `tickToken` adds `elapsedMs / 60_000`
  (a non-terminating binary fraction — `4000/60000 =
  0.06666666666666667`) to `ageMinutes` every 4 seconds; after a few
  ticks this accumulates ordinary floating-point rounding noise. The
  original static mock fixtures were always clean integers, so this
  branch never needed rounding until TASK 04's live stream started
  mutating the value repeatedly.
- Fix: round in all three branches, not just two —
  `` `${Math.round(minutes)}m` ``. All 3 call sites
  (`TokenDetailHeader.js`, `OpportunitiesTable.js`,
  `SelectedTokenPanel.js`) go through this one function, so the fix
  covers every place age is displayed.

### Verification
- `npm run lint` / `npm run build` — PASS.
- Reproduced the exact failure with a standalone script (start at 6,
  add `4000/60000` six times → `6.399999999999999`) and confirmed the
  fixed function returns `"6m"`; also checked a longer run (100+
  ticks) stays clean (`"22m"`, no drift creeping back in).

## 0.13.0 — TASK 12 (EVM Adapter) — opens PHASE 3

**DECISIONS (made together, per ROADMAP.md's "TASK 12 ... must not
scrape data; only documented/authorized APIs and RPC endpoints"
constraint, and consistent with TASK 09's precedent of deciding
infrastructure choices together, not unilaterally):**
- **Library: viem**, over ethers.js. Read-only usage only (no wallet,
  no signer, no transaction signing exists anywhere in this project —
  see ROADMAP.md: no phase includes real trade execution). viem is
  lighter (~27kb vs ~130kb), tree-shakeable, and the current standard
  recommendation for new read-only/multi-chain work in 2026.
- **RPC endpoints: viem's own built-in public defaults**, not a signed-up
  provider. This app's actual call volume (at most one capture pass a
  day — TASK 10's Vercel Hobby cron limit) is genuinely served by a
  shared public endpoint; a dedicated provider (Chainstack's free tier
  covers all four target chains, if ever needed) would be solving a
  problem this app doesn't have yet — same reasoning as TASK 09's Neon
  free-tier choice. `RPC_URL_<CHAIN>` env vars can override the
  default per chain independently, with zero code changes, if that
  changes later.

### Added
- `lib/chain/clients.js` — `getEvmClient(chainKey)`, a lazy (never
  touches env vars or the network at import time — same posture as
  `getDb()`, TASK 09), cached, read-only viem `PublicClient` per
  supported chain. `SUPPORTED_EVM_CHAINS = ["ETH", "BASE", "ARB",
  "BSC"]` — the same chain keys `mocks/tokens.js`/
  `lib/data/mockChainMap.js` already use (SOL excluded — not EVM).
  Confirmed viem's chain IDs for all four (1, 8453, 42161, 56) match
  `mockChainMap.js`'s `MOCK_CHAIN_TO_CHAIN_ID` exactly — no
  reconciliation needed when mock data is eventually replaced by real
  on-chain reads.
- `lib/chain/erc20.js` — `fetchTokenIdentity(chainKey, address)`: reads
  a real ERC-20 contract's `name`/`symbol`/`decimals`/`totalSupply` via
  the 4 standard view functions (concurrent reads, minimal inline ABI).
  Fills exactly the `Token` conceptual shape from
  `docs/ARCHITECTURE.md` §5 (`address, chainId, symbol, name`) — the
  first time any of that model's fields come from a real chain instead
  of a mock fixture. Deliberately does NOT compute price, liquidity,
  volume, or holder concentration — those need indexing swaps/transfers
  over time, not a single point-in-time contract read (TASK 13 — SWAP
  INDEXING, TASK 14 — HOLDER ANALYSIS, TASK 15 — LIQUIDITY ANALYSIS).
- `lib/chain/health.js` — `getLatestBlockNumber(chainKey)`: the
  simplest possible proof an RPC connection works, without needing a
  known contract address.
- `app/api/debug/evm-status/route.js` — manual verification endpoint;
  calls `getLatestBlockNumber` for all 4 chains independently (one
  chain failing doesn't hide whether the others work) and returns a
  JSON summary. Not a cron job, not called by anything else.
- `.env.example`: documented the 4 optional `RPC_URL_*` overrides.

### Verification
- `npm run lint` / `npm run build` — PASS; `/api/debug/evm-status`
  compiles as a dynamic route; existing routes/pages completely
  unaffected (nothing else imports `lib/chain/*` yet).
- Verified offline (no network needed): all 4 viem `PublicClient`s
  construct correctly with the right `chainId` (1/8453/42161/56) and
  correct default public RPC URL per chain; `getEvmClient("SOL")`
  throws the intended clear error (SOL isn't EVM); the client cache
  returns the same instance on a second call for the same chain key.
- `/api/debug/evm-status` manually verified against the running dev
  server: returns `200` (never crashes) even when every underlying RPC
  call fails, with each chain's specific error reported independently.
  **This sandbox's network egress is restricted to package registries
  — no RPC host is reachable from it** (confirmed: all 4 calls failed
  with viem's own `403 Host not in allowlist` error, naming the exact
  host each chain correctly tried to reach). This is the sandbox's
  limitation, not the code's — **please hit
  `http://localhost:3000/api/debug/evm-status` yourself** (no signup
  needed, no env vars required) and confirm it returns real block
  numbers for all 4 chains.

### Decisions
- No route or component reads through this adapter yet — pure
  infrastructure, same precedent as TASK 09. Nothing in `mocks/
  tokens.js` or the dashboard changes; wiring real on-chain reads into
  anything user-facing needs TASK 13–15 first (price/volume/holders),
  since a token's identity alone isn't enough to compute a Score/Risk/
  Signal.
- `totalSupply` is returned as a string, not a `BigInt` — `BigInt`
  doesn't survive `JSON.stringify` (would throw), and every other
  large-number field in this codebase (Drizzle's `numeric` columns,
  TASK 09) is already string-shaped for the same reason.
- No dependencies beyond `viem` itself.

## 0.12.1 — Rebrand (Sherlog) + Phase 1 final verification

Not a numbered roadmap task — a cross-cutting aesthetic/branding pass
requested directly, plus a regression check of everything built in
Phase 1 now that Phase 2 has touched shared UI code.

### Added
- `public/logo.png` — the Sherlog wordmark (geometric green wireframe
  on a transparent background — confirmed via its alpha channel before
  using it, so it renders cleanly on this app's dark UI instead of
  showing a stray white box).

### Changed
- **Color palette** (`app/globals.css`): `bg`/`surface`/`accent`/
  `positive` now come from Sherlog's green brand palette (`#0A0A0B`,
  `#111D11`, `#3AD35C`). Two deliberate departures from applying the
  palette literally, both computed via WCAG contrast ratios (see
  below), not eyeballed:
  - `surface-elevated` uses a derived `#142218`, not the palette's
    `#0D411F` directly. That color is markedly brighter/more saturated
    than the others, and `surface-elevated` backs hovers, badges, and
    meter tracks throughout the entire app — at full saturation, muted
    text on top of it dropped to a 2.11:1 contrast ratio (well below
    even the original theme's already-borderline 3.26:1 for that same
    pairing). `#142218` restores it to 2.98:1, matching the original's
    step size (~1.05:1 contrast between `surface` and
    `surface-elevated`) recolored into green rather than copying the
    brighter swatch verbatim.
  - `negative` (red, `#e2555f`) and `warning` (amber, `#d9a441`) are
    UNCHANGED — deliberately kept out of the green palette. This app
    uses red/amber specifically to flag risk (`RISK: HIGH`,
    `NO TRADE`, `FALLING` liquidity — TASK 07) and an all-green UI
    would erase that signal exactly where it matters most. `positive`
    was moved onto the same green as `accent` (previously a separate
    teal, `#3fb68b`) — "good" and "brand" converging on one green is
    intentional here, not a redundancy.
  - `line`/`line-strong` are derived dark desaturated greens — hairline
    borders were never a flagged brand color in the original design
    either, just a subtle separator; WCAG text-contrast thresholds
    don't apply to them.
  - Text colors (`text-primary`/`secondary`/`muted`) are unchanged —
    the given palette has no light tones suited to body text, and
    legibility wins over strict palette adherence there.
- **Branding**: `components/layout/Topbar.js`'s "MICROCAP ENGINE" text
  replaced with the logo image (113×22, matching the source asset's
  5.11:1 aspect ratio). `components/dashboard/DashboardHeader.js`'s
  "Microcap Engine" heading renamed to "Sherlog" (text only — the logo
  image lives once, in the Topbar, which is present on every page；
  putting it in both places would be redundant).
- All 9 `metadata.title` occurrences across `app/` renamed from
  "... — Microcap Engine" to "... — Sherlog" (`layout.js`, dashboard,
  token detail ×2, analytics, paper-trading, watchlist, settings,
  signals, scanner). `layout.js`'s description ("Real-Time Microcap
  Intelligence Terminal") was left as-is — it describes the app's
  category, not the old brand name.
- `package.json`'s `name` field: `microcap-engine` → `sherlog`.
- `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`,
  `docs/MICROCAP_ENGINE_STATE.md`: H1 titles renamed to "SHERLOG — ...".
  **Scope note**: hundreds of in-code comment headers
  (`// MICROCAP ENGINE — ...`) and historical CHANGELOG entries were
  deliberately NOT rewritten — that's a much larger, purely cosmetic
  diff across nearly every file in the codebase for no functional
  benefit, and rewriting historical CHANGELOG entries specifically
  would falsify the record of what was true at the time. If you want
  that deeper sweep too, say so explicitly and it can be a follow-up.

### Phase 1 final verification
Re-ran the full Phase 1 surface (TASK 01–08) after the palette/branding
change, since it touches shared components (`Card`, `Badge`,
`Sidebar`, `Topbar`, `DashboardHeader`, every color token) used by
every page:
- `npm run lint` / `npm run build` — PASS, identical route table.
- Every Phase 1 route (`/dashboard`, `/token/nxa`, `/token/hlx`,
  `/token/mrbl`, `/token/doesnotexist`, `/scanner`, `/signals`,
  `/watchlist`, `/settings`, `/paper-trading`) returns `200`; Phase 2
  routes (`/analytics`, `/api/cron/capture-snapshots`) unaffected
  (`capture-snapshots` still correctly `500`s without `DATABASE_URL`,
  same as always in this sandbox).
- Confirmed in rendered HTML: the logo renders (`/logo.png` present),
  zero leftover "Microcap Engine" text anywhere, page titles read
  "... — Sherlog".
- Confirmed in compiled CSS: `--color-accent: #3ad35c`,
  `--color-positive: #3ad35c`, `--color-surface-elevated: #142218`,
  `--color-negative: #e2555f` and `--color-warning: #d9a441`
  (unchanged) all present as designed.
- HLX still renders "EXTREME" with both TASK 05 charts present; MRBL
  still renders "NO TRADE"; the hydration-mismatch hotfix still holds
  (two `/dashboard` requests, seconds apart, both show the identical
  static `12:42:31` "Last update" text — SSR/hydration agreement
  unaffected by the palette change). No console/server errors in any
  of the above.
- **Not verified**: actual visual appearance (this sandbox has no
  browser/screenshot capability) — all of the above confirms structural
  correctness and WCAG contrast math, not "does it look good". Please
  eyeball it yourself once deployed/running locally.

## 0.12.0 — TASK 11 (Analytics) — closes PHASE 2

**Confirmed:** TASK 10's capture route was verified end-to-end against
the real Neon database — `{"ok":true,"tokensProcessed":10,
"marketSnapshotsInserted":10,"signalsInserted":10,
"auctionRowsInserted":8}` (8, not 10 — MRBL/PTRA have no auction,
exactly as expected).

### Added
- `lib/data/analytics.js` — the **first read path in the app that
  queries the database** instead of `mocks/tokens.js`. Every other
  page (dashboard, token detail) still reads mocks exclusively; this
  one reads back what TASK 10 captured. The underlying data is still
  from the mock simulation (no real on-chain source exists yet — EVM
  Adapter is TASK 12), so these numbers describe "how the mock signals
  looked over time," not real market performance — this task is about
  the read/aggregation path being real, not the data itself yet.
  - `getOverallStats`: total captures, buyable-capture count (via
    Postgres `count(*) filter (where is_buyable)`), average score,
    and distinct calendar days captured (`count(distinct
    date_trunc('day', timestamp))`).
  - `getSetupBreakdown`: capture count grouped by `setup` state.
  - `getLatestSignalPerToken`: each token's most recent captured
    signal (joins `signals`+`tokens`, dedupes to newest-per-token in
    JS rather than a `DISTINCT ON` query — deliberate simplicity at
    this project's tiny data scale, documented as such in code).
  - `getAnalyticsSummary`: fetches all three concurrently for the page.
- `app/(app)/analytics/page.js` — rewritten from its TASK 01
  `RoutePlaceholder` into a real async Server Component.
  `export const dynamic = "force-dynamic"` so `next build` never tries
  to run the query at build time (when `DATABASE_URL` may not be
  configured — same discipline as TASK 09/10). Shows 4 summary metric
  cards, a signal-state breakdown, and a latest-capture-per-token list.
- `components/analytics/SetupBreakdownCard.js`,
  `LatestSignalsTable.js` — presentational, reuse existing `Card`/
  `SectionHeader`/`SignalBadge`/`Badge` for visual consistency with the
  rest of the app; no new visual primitives introduced.
- `components/analytics/AnalyticsUnavailable.js` — friendly empty
  state for two distinct, both-normal conditions: `DATABASE_URL` not
  set (`getDb()` throws) vs. a reachable database with zero captures
  yet (nothing for the cron route to have written). Each shows
  different, actionable guidance rather than one generic message.

### Verification
- `npm run lint` / `npm run build` — PASS; `/analytics` compiles as a
  dynamic (`ƒ`) route, confirming it won't be prerendered at build
  time.
- All three Drizzle queries verified via `.toSQL()` (inspects the
  generated SQL without executing it — no live database needed) and
  confirmed to produce correct, valid Postgres: the aggregate query's
  `count(*) filter (...)`/`avg(...)`/`date_trunc(...)` all render
  correctly; the breakdown query's `GROUP BY`/`ORDER BY` are correct;
  the join query's `INNER JOIN ... ON` uses the right column names
  from the TASK 09 schema.
- `/analytics` manually verified against the running dev server
  without `DATABASE_URL` set: returns `200` (not a crash) with the
  "Database not connected" empty state, and `/dashboard` remains
  completely unaffected.
- **Not verified with actual data rendered**: the "has real rows"
  render path (summary cards, breakdown, latest-per-token list against
  your actual captured signals) was not seen from this sandbox — same
  network restriction as TASK 09/10. You already have at least one
  real capture from TASK 10's verification, so **please open
  `/analytics` yourself** (locally or once deployed) and confirm it
  renders sensibly — the query syntax is confirmed correct, but an
  actual rendered screen is worth a look.

### Decisions
- No dependencies added.
- Scope is read-only analytics over what TASK 10 already persisted —
  no new writes, no recomputation of score/risk/signal (this module
  never calls `computeScore`/`computeRisk`/`computeSignal`, it only
  reads their already-persisted output). The full backtesting/
  expectancy engine described in `docs/ARCHITECTURE.md` §10 is Phase 6
  (TASK 19–21), a different, much larger task — this is explicitly the
  Phase 2 "Analytics" (aggregate what's been captured), not that.
- `getLatestSignalPerToken` dedupes in JavaScript rather than using a
  Postgres `DISTINCT ON` query. At this project's actual scale (a
  handful of mock tokens, at most one capture/day on Vercel Hobby) the
  row count fetched is always tiny; the simpler, more obviously-correct
  approach was chosen over a marginally more efficient one.

## 0.11.0 — TASK 10 (Historical Snapshots)

**Follow-up confirmed:** `npm run db:push` (TASK 09) was run
successfully against a real Neon database — the 5 tables from TASK 09
now exist for real, not just as a migration file.

### Added
- `lib/data/capture.js` — `captureSnapshot()`, one "capture pass":
  advances every `mocks/tokens.js` token by one simulated tick
  (reusing TASK 04's `tickToken` — no new jitter logic invented), then
  upserts its `tokens` identity row and inserts one `market_snapshots`
  row, one `signals` row, and (only if the token has a live/ended
  auction) one `auction_data` row — all through the TASK 09 schema.
  `splitScoreBreakdown()` divides the Score Engine's 8-component
  breakdown into the `signals` table's 5 named sub-score columns
  (`momentumScore` = volume+buyers+pressure, `liquidityScore`,
  `holderScore`, `auctionScore`, `externalSignalScore` = fomo+price) —
  these 5 always sum to exactly `token.score`, verified for several
  breakdown shapes including an all-zero one (MRBL). Also computes
  `isBuyable` (see the `signals` table entry below) via
  `isBuyableSetup()`, verified against all 6 `SIGNAL_STATES`.
- `lib/data/mockChainMap.js` — maps each mock token's display `chain`
  string ("SOL"/"ETH"/...) to the integer `chainId` the TASK 09 schema
  expects. EVM chains map to their real public chain IDs (ETH=1,
  BASE=8453, ARB=42161, BSC=56); SOL (non-EVM, no integer chain ID)
  maps to a `0` sentinel rather than a fabricated number. Explicitly a
  temporary shim, superseded once TASK 12 (EVM Adapter) does real
  on-chain ingestion. Mock tokens also have no real contract address,
  so captured rows use a synthetic `"mock:<id>"` string — deliberately
  not formatted like a real address, so it can never be mistaken for
  one.
- `app/api/cron/capture-snapshots/route.js` — the Next.js Route
  Handler that runs one capture pass on request. Checks
  `Authorization: Bearer ${CRON_SECRET}` if `CRON_SECRET` is set
  (skipped if unset — same dev-friendly posture as `getDb()`'s
  `DATABASE_URL` check). Returns a small JSON summary (counts, not
  full rows) or a `500` with the underlying error message.
- `vercel.json` — registers the route on Vercel Cron:
  `0 0 * * *` (daily, midnight UTC) — **Vercel Hobby caps cron
  frequency at once per day**; anything sub-daily is rejected at
  deploy time. If you want more frequent snapshots without upgrading
  to Pro ($20/mo), the route itself is a normal HTTP endpoint — any
  external scheduler (a free cron-ping service, a script on your own
  machine, etc.) can call it at any frequency; that's a separate
  decision, not implemented here.
- `.env.example`: documented the optional `CRON_SECRET` variable.
- `lib/data/db/schema.js`: `signals` gained an `isBuyable` boolean
  column (`is_buyable`, `.default(false)` so the migration is safe on
  a table that may already have rows — application code always
  supplies an explicit value on insert, the default is a migration
  safety net only, never a real "unknown" state in practice). Set from
  `isBuyableSetup(setup)` — `true` only for `SETUP A`/`EXTREME`,
  deliberately narrower than "not IGNORE" (excludes `SETUP B`,
  `WATCH`/`WATCH+`), matching the Signal Engine's own strict-not-loose
  posture for its highest tier. This is *your* explicit ask for this
  task: a durable, directly-queryable record of which tokens looked
  buyable on a given day and which didn't — `WHERE is_buyable = true`
  instead of remembering/replicating the `setup` threshold in every
  query. New migration: `drizzle/0001_same_hellcat.sql`.

### Verification
- `npm run lint` / `npm run build` — PASS; new route compiles as a
  dynamic (`ƒ`) endpoint, everything else unchanged.
- `splitScoreBreakdown`'s sum-preservation verified against several
  sample breakdowns (including an all-zero one) in isolation.
  `isBuyableSetup` verified against all 6 `SIGNAL_STATES` values in
  isolation.
- `/api/cron/capture-snapshots` manually verified against the running
  dev server: without `DATABASE_URL` set, returns `500` with the
  expected friendly error (not a crash) and `/dashboard` remains
  completely unaffected; with `CRON_SECRET` set, an unauthenticated
  request correctly gets `401`, and a correctly-authenticated request
  passes the auth check and proceeds to the (expected, in that test)
  `DATABASE_URL` error.
- **Not verified end-to-end**: an actual capture pass against a real
  database (insert into all 4 tables) was not run from this sandbox —
  same network restriction as TASK 09. You ran `db:push` yourself
  successfully, so **please run `npm run db:push` again first** (to
  apply the new `is_buyable` column via `drizzle/0001_same_hellcat.sql`
  — a plain `ALTER TABLE ... ADD COLUMN`, safe on your existing empty
  tables), **then hit this route yourself**
  (`http://localhost:3000/api/cron/capture-snapshots` locally with
  `DATABASE_URL` set) and paste me the JSON response — that closes the
  loop on whether the actual inserts work end-to-end.

### Decisions
- No dependencies added.
- Each capture starts fresh from the static mock baseline, not from
  the previous capture's stored values — `tickToken`'s own jitter
  still gives each row real variation, but this is NOT a continuously-
  compounding series across captures. Resuming from the last DB row
  would need either an always-on process or a richer persisted shape
  (the schema doesn't store `volumeAcceleration`/`buyerAcceleration`,
  which `tickToken` needs) — out of scope for V1, documented in code
  rather than silently glossed over.
- `market_snapshots.volume15m`/`buys5m`/`sells5m`/`uniqueSellers5m`/
  `top1Pct`/`top5Pct` and `auction_data.tokensSold` are left `null` on
  every insert — no corresponding mock field exists for any of them;
  left empty rather than invented.

## 0.10.0 — TASK 09 (Database)

**DECISIONS (made together, not unilaterally, per ROADMAP.md's
explicit "DECISION REQUIRED" flag on this task):**
- **ORM/driver: Drizzle ORM**, over Prisma/Kysely/raw `pg`. No codegen
  step (works cleanly with Turbopack fast refresh), ~7.4kB footprint,
  native edge/serverless support, schema-as-plain-JS matches this
  codebase's existing style (`lib/scoring`, `lib/risk`, `lib/signal`).
- **Hosting: Neon**, free tier, Postgres only (no bundled
  auth/storage/realtime — not needed here). Chosen over Supabase
  (heavier, free tier smaller at 500MB) and Docker-local (this app is
  meant to eventually deploy on Vercel, where a hosted Postgres is
  needed anyway). Personal-use scale — no paid/HA tier needed; Neon's
  branch feature covers a lightweight "prod vs. experiment" split
  within the same free project if ever wanted.
- Driver: `drizzle-orm/neon-http` + `@neondatabase/serverless` (HTTP,
  not TCP) — the only driver combination that works from Vercel
  serverless functions without connection-pooling infrastructure.

### Added
- `lib/data/db/schema.js` — Drizzle table definitions translating
  `docs/ARCHITECTURE.md` §5's conceptual `Token`/`MarketSnapshot`/
  `AuctionData`/`Signal`/`PaperTrade` shapes into real Postgres tables:
  `tokens`, `market_snapshots`, `auction_data`, `signals`,
  `paper_trades`. All price/amount fields use `numeric` (arbitrary
  precision), not `real`/`double precision` — microcap prices
  routinely need far more significant digits than floats reliably
  hold. Every time-series table is indexed on `(token_id, timestamp)`
  (or `entry_time` for `paper_trades`), since "snapshots/signals for
  token X, ordered by time" is the only query shape that matters here.
  `tokens` has a unique index on `(address, chain_id)`, not `address`
  alone — the same address could exist on more than one chain.
- `lib/data/db/client.js` — `getDb()`, a lazily-initialized Drizzle
  client. Deliberately does not touch `process.env.DATABASE_URL` at
  import time, only when actually called, so this file existing in the
  tree never breaks `next build` or any route that doesn't use it.
  Throws a clear, actionable error ("copy .env.example to .env...") if
  `DATABASE_URL` is missing, rather than a generic connection failure.
- `drizzle.config.js` — `drizzle-kit` CLI config (schema path,
  migrations output folder, Postgres dialect). Only used by the CLI,
  never imported by the app.
- `drizzle/0000_rich_jackpot.sql` (+ `drizzle/meta/`) — the initial
  migration, generated from the schema above via `drizzle-kit
  generate`. Committed, as Drizzle migrations are meant to be — this
  is the schema's version history, not a build artifact.
- `.env.example` — documents the expected `DATABASE_URL` variable (a
  Neon connection-string placeholder, never a real value).
  `.gitignore`'s `.env*` rule got a `!.env.example` exception so this
  template is actually trackable — it wasn't before, an oversight
  worth calling out since it silently would have blocked committing
  the one env file meant to be shared.
- `package.json`: `db:generate` (`drizzle-kit generate` — diffs the
  schema against migration history, fully offline, needs no live DB),
  `db:push` (`drizzle-kit push` — directly syncs schema to a live DB,
  for quick dev iteration), `db:studio` (`drizzle-kit studio` — visual
  browser, needs a live DB).

### Changed
- `docs/ARCHITECTURE.md` §2's stack table and §5's conceptual-model
  section updated to reflect that the schema now exists concretely
  (previously "NOT YET IMPLEMENTED — DECISION REQUIRED").

### Verification
- `npm run lint` / `npm run build` — PASS; existing routes/pages
  completely unaffected (nothing in the app imports `lib/data/db/*`
  yet — that's TASK 10).
- `npm run db:generate` — PASS, fully offline: produced correct SQL
  for 5 tables (18 columns on the widest, `market_snapshots`), 4
  foreign keys with `ON DELETE CASCADE`, 5 indexes, without any
  `DATABASE_URL` configured — confirms `generate` never needs a
  reachable database.
- `npm run db:push` without `DATABASE_URL` set — failed with
  drizzle-kit's own clear parameter error, as expected (this command
  DOES need a live connection — verified the failure mode is legible,
  not a stack trace).
- `getDb()` without `DATABASE_URL` set — verified it throws the
  intended actionable error message rather than crashing on a missing
  client or a raw driver exception.
- No live Neon instance was available in the sandbox this was built in
  (network egress is restricted to package registries; a hosted
  Postgres instance couldn't be reached), so `db:push`/`db:studio`
  against a real database, and any actual read/write query, were NOT
  executed end-to-end here. **You'll need to run `npm run db:push`
  yourself once `.env` has a real `DATABASE_URL`** to actually create
  these tables on your Neon project — this patch only gets you to "the
  schema is ready to push."

### Decisions
- Scope is infrastructure only: no route or component reads/writes
  through this schema. The dashboard/token-detail pages are completely
  unaffected and keep reading `mocks/tokens.js` exclusively, same as
  every task since TASK 01 — wiring real reads/writes is TASK 10 —
  HISTORICAL SNAPSHOTS, not this one.
- `signals.momentumScore` collapses the Score Engine's separate
  `volume`/`buyers` components (see `lib/scoring/scoreEngine.js`) into
  one column, matching `docs/ARCHITECTURE.md` §5's persisted shape
  exactly rather than inventing new columns beyond what the
  architecture doc specifies. The display-level 8-component breakdown
  (`SCORE_COMPONENT_MAX`) stays exactly as-is; this table is a
  narrower, persisted view of it.
- IDs are `uuid` with `gen_random_uuid()` defaults (built into Postgres
  since v13, confirmed no extension needed on Neon) rather than serial
  integers — safer for a schema that may eventually need
  multi-source/concurrent inserts (on-chain adapters, Phase 3) without
  a central sequence.

## 0.9.0 — TASK 08 (Signal Engine)

### Added
- `lib/signal/signalEngine.js` — `computeSignal(token)`, the project's
  first real Signal Engine, per the conceptual `Signal` shape in
  `docs/ARCHITECTURE.md` §5 (`score, setup, ..., reason`). Reconciles
  the already-computed Score Engine (TASK 06) and Risk Engine (TASK 07)
  output into a final `signal` state (one of `SIGNAL_STATES`) plus a
  short `reason` string:
  1. **Risk gate**: if `risk.overall` is HIGH (`noTrade`), signal is
     forced to `IGNORE` regardless of score — the concrete enforcement,
     at the signal layer, of ARCHITECTURE.md §7's "Score 90 + Risk HIGH
     = NO TRADE".
  2. Otherwise, signal follows the score tier directly
     (IGNORE/WATCH/WATCH+/SETUP B/SETUP A), with one escalation: a
     SETUP A+ score tier only becomes `EXTREME` when BOTH volume and
     buyer acceleration are independently ≥ 3x — high score alone isn't
     "extreme", violent momentum on top of it is.
  - Unlike Score and Risk, this engine needs **zero** authored seed —
    every input it reads (score, risk, momentum) already has a real
    feature source. It's the first fully-computed engine in the
    project.

### Changed
- `mocks/tokens.js`: fixtures no longer author a `signal` field at all
  (previously the last hand-authored attribute on each token);
  `mockTokens` now computes `signal`/`signalReason` via `computeSignal`
  after `computeScore`/`computeRisk`, resolving the drift between the
  authored `signal` and the computed score tier that TASK 06/07 both
  explicitly deferred to this task.
- `lib/realtime/mockStream.js` (TASK 04): `tickToken` now also calls
  `computeSignal` after recomputing score/risk, so the live dashboard's
  signal badge never silently disagrees with the score/risk badges
  sitting next to it.
- `components/token/TokenDetailHeader.js`: now shows `signalReason` as
  a small caption under the score/signal badges — the one UI change in
  this task, giving the signal's reasoning a visible home instead of
  only existing in data.

### Verification
- `npm run lint` / `npm run build` — PASS.
- Verified with a standalone script mirroring the engine before wiring
  it in, then re-verified the wired `mockTokens` output matches
  exactly, for all 10 tokens.
- `npm run dev` — verified manually: `/token/hlx` renders "EXTREME"
  with the reason "Score 95 (SETUP A+) with exceptional volume (4.1x)
  and buyer (3.4x) acceleration."; `/dashboard`, `/token/ptra`
  unaffected in terms of HTTP status; no server errors.

### Decisions
- No dependencies added.
- PTRA is a good demonstration of the risk gate: its score tier alone
  (16, IGNORE) would already map to IGNORE anyway, but MRBL/PTRA both
  now show the `reason` explicitly crediting the risk override, not
  just the score, making the "NO TRADE" rule visible in the data even
  when it wouldn't have changed the outcome.
- Recomputed signals differ from the old hand-authored ones for 6 of 10
  tokens (only NXA, DRFT, MRBL, HLX land on the same label as before) —
  expected, same as TASK 06/07: the old `signal` values were narrative
  placeholders that were never actually derived from score or risk, so
  reconciling them was the whole point of this task.
- `EXTREME`'s momentum bar (≥ 3x on both volume and buyer acceleration)
  is a V1 threshold, not calibrated against real data — consistent with
  Score/Risk Engine's own "V1, not final" framing. Only HLX currently
  clears it.

## 0.8.0 — TASK 07 (Risk Engine)

### Added
- `lib/risk/riskEngine.js` — `computeRisk(token)`, the project's first
  real Risk Engine, per `docs/ARCHITECTURE.md` §7. **Independent of the
  Score Engine**: never reads `token.score`/`scoreBreakdown`, and
  `lib/scoring/scoreEngine.js` never reads `token.risk` — a token can
  score high and still be flagged high risk, per architecture.
  - `liquidityStatus` (HEALTHY/THIN/CRITICAL) computed from `liquidity`
    (USD) + `liquidityTrend`.
  - `concentration` (LOW/MODERATE/HIGH) computed from
    `top10Concentration`.
  - `exitStatus` (CLEAR/SLIPPAGE RISK/ILLIQUID) derived directly from
    `liquidityStatus` (V1: liquidity depth is the primary exit-
    feasibility driver at this phase; kept out of the aggregate below
    to avoid double-counting the same liquidity signal).
  - `contractRisk` and `suspiciousWallets` have no real feature source
    (bytecode/honeypot analysis and wallet-clustering detection don't
    exist yet — no adapter) — passed through from an authored seed
    unchanged, same principle as `fomo`/`price` in the Score Engine.
  - New aggregate `overall` (LOW/MODERATE/HIGH) and `noTrade` boolean
    (`overall === "HIGH"`) — the concrete implementation of
    ARCHITECTURE.md §7's "Score 90 + Risk HIGH = NO TRADE" rule.

### Changed
- `mocks/tokens.js`: each fixture's `risk` now seeds only
  `{ contractRisk, suspiciousWallets }`; the exported `mockTokens` maps
  every fixture through `computeRisk` (alongside TASK 06's
  `computeScore`) to produce the real `risk` object.
- `lib/realtime/mockStream.js` (TASK 04): `tickToken` now also calls
  `computeRisk` after mutating a token's live fields (liquidity/trend
  feed `liquidityStatus`/`exitStatus`), so risk badges on the live
  dashboard track the mock stream instead of staying frozen.
  `concentration`/`contractRisk`/`suspiciousWallets` still don't change
  live — `top10Concentration` isn't ticked (TASK 14 territory) and the
  other two have no feature source regardless.
- `components/dashboard/SelectedTokenPanel.js`: the RISK section header
  now shows the new aggregate `overall` tier, and a "· NO TRADE" marker
  when `noTrade` is true — the one small UI change in this task, giving
  the architecture's core risk principle a visible home instead of
  only existing in data.

### Verification
- `npm run lint` / `npm run build` — PASS.
- Verified with a standalone script mirroring the engine before wiring
  it in, then re-verified the wired `mockTokens` output matches
  exactly, for all 10 tokens.
- `npm run dev` — verified manually: `/token/mrbl`'s rendered HTML
  shows "HIGH · NO TRADE" in the RISK section (MRBL: liquidity $8.1K,
  68% top-10 concentration, contract HIGH, 3 suspicious wallets — every
  input already bad); `/dashboard`, `/token/nxa`, `/token/ptra`
  unaffected in terms of HTTP status; no server errors.

### Decisions
- No dependencies added.
- Computed `liquidityStatus`/`concentration` land extremely close to
  the old hand-authored labels for 9 of 10 tokens (only NXA shifts
  HEALTHY → THIN, since $42.1K liquidity falls just under the $50K
  threshold) — a much smaller drift than TASK 06's score numbers, since
  the original risk labels already tracked liquidity/concentration
  fairly literally.
- `contractRisk`/`suspiciousWallets` remain pass-through, same as
  `fomo`/`price` in the Score Engine — no on-chain bytecode analysis or
  wallet-clustering data exists (that's real infrastructure, not a
  formula this engine could reasonably invent).
- Coincidentally, the two tokens now flagged `noTrade: true` (MRBL,
  PTRA) are also the two lowest-scoring tokens from TASK 06 — this is
  NOT because the engines talk to each other (they don't, by design);
  it's an artifact of the original mock narrative authoring every
  attribute of those two tokens as uniformly weak. A future mock token
  with a high score AND high risk remains fully possible and would
  display correctly (score panel and risk panel are independent reads).

## 0.7.1 — Hotfix (hydration mismatch on "Last update")

### Fixed
- `lib/realtime/useMockLiveStream.js` (TASK 04 bug, found while
  preparing TASK 07): `lastUpdate`'s initial state was computed as
  `useState(() => formatClockTime(new Date()))`. That initializer runs
  once during SSR and again during client hydration — at two different
  wall-clock moments, often different seconds — producing a React
  hydration mismatch on `DashboardHeader`'s "Last update" text
  (`+15:30:14` / `-15:30:13`-style errors in the browser console,
  forcing a client-side re-render of the whole tree).
- Fix: `lastUpdate` now starts `undefined`, so `DashboardHeader`'s
  existing default prop (the static `mockLastUpdate` fixture,
  `"12:42:31"`) renders identically on the server and on the client's
  first pass — no clock involved, so no mismatch is possible. The real
  current time is set inside `useEffect` instead, which by definition
  never runs during SSR, so it only touches the DOM after hydration has
  already completed.
- One line needed `// eslint-disable-next-line
  react-hooks/set-state-in-effect`, since this is a deliberate,
  React-docs-endorsed pattern for deferring a browser-only value past
  hydration — not the accidental "state that should’ve been computed
  during render" case that rule normally catches.

### Verification
- `npm run lint` / `npm run build` — PASS.
- `npm run dev` — verified manually: three separate `curl` requests to
  `/dashboard`, several real seconds apart, now all return the exact
  same server-rendered "Last update: 12:42:31" text (previously each
  request returned a different, real-clock-derived time — the direct
  cause of the mismatch). The real clock only takes over client-side,
  after mount, so it can no longer disagree with the server's HTML.

## 0.7.0 — TASK 06 (Score Engine)

### Added
- `lib/scoring/scoreEngine.js` — the project's first real Score Engine,
  per `docs/ARCHITECTURE.md` §6 (V1 weights, not final — real
  calibration is TASK 21). Exports `computeScore(token)`, returning
  `{ score, breakdown, tier }` where `breakdown` always sums exactly to
  `score` (explainability requirement). Also the new canonical home for
  `SCORE_COMPONENT_MAX`, `SCORE_COMPONENT_LABELS`, `SCORE_TIERS`, and
  `getScoreTier` (moved here from `mocks/tokens.js`, which now
  re-exports them unchanged for backward compatibility).
  - Six of the eight components — `auction`, `volume`, `buyers`,
    `pressure`, `liquidity`, `holders` (80/100 of the weight) — are
    genuinely computed from a token's existing feature fields (Long
    auction snapshot, volume/buyer acceleration, buy pressure,
    liquidity + trend, top-10 concentration).
  - The remaining two — `fomo` (no Long/Fomo/external-signal adapter
    yet, TASK 16–18) and `price` (no price-structure model yet) — have
    no real feature source, so the engine does not invent a formula
    for them: it passes through `token.scoreBreakdown.fomo`/`.price`
    unchanged rather than fabricating an input that doesn't exist.

### Changed
- `mocks/tokens.js`: token fixtures no longer hand-author `score`/a
  full `scoreBreakdown` — each raw fixture now carries only a
  `scoreBreakdown: { fomo, price }` seed (the two pass-through
  components), and the exported `mockTokens` maps every fixture through
  `computeScore` to produce the real `score`/`scoreBreakdown` shown
  across the UI. `SCORE_COMPONENT_MAX`/`LABELS`/`SCORE_TIERS`/
  `getScoreTier` are now re-exports of `lib/scoring/scoreEngine.js` —
  no consuming component (`ScoreBadge.js`, `MicrocapScorePanel.js`)
  needed to change, since they still import from `@/mocks/tokens`.
- `lib/realtime/mockStream.js` (TASK 04): `tickToken` now recomputes
  `score`/`scoreBreakdown` via `computeScore` after mutating a token's
  live fields, closing the gap TASK 04 explicitly deferred ("no Score
  Engine exists yet — TASK 06"). The dashboard's score, tier badge, and
  score-sorted table order now genuinely track the live mock stream
  instead of staying frozen while volume/pressure/liquidity move around
  them. `holders`/`top10Concentration`/`auction` are still not ticked
  (TASK 07/14/16-17 territory) — the engine reads their existing static
  values as inputs for the `holders`/`auction` components either way.

### Verification
- `npm run lint` — PASS, no warnings.
- `npm run build` — PASS; route table unchanged.
- Verified for all 10 mock tokens: `score` equals the exact sum of
  `scoreBreakdown`'s 8 values (no rounding drift), computed via a
  standalone script mirroring the engine's logic before wiring it in.
- `npm run dev` — verified manually: `/token/nxa`'s rendered HTML shows
  the engine's actual output (score 82/100, "SETUP A", Long Auction
  16/20 — matching the standalone verification exactly, not the old
  hand-authored 91/100); `/dashboard`, `/token/hlx`, `/token/mrbl`
  unaffected in terms of HTTP status; no server errors.

### Decisions
- No dependencies added — pure arithmetic, no ML/statistics library.
- Recomputed scores intentionally do NOT match the old hand-authored
  fixture numbers token-for-token (e.g. NXA: 91 → 82, QRN: 73 → 39).
  This is expected and correct: the old numbers were narrative
  placeholders invented for TASK 01/02 demo purposes, and a genuinely
  computed V1 score is not obligated to reproduce them. Relative
  ordering is broadly preserved (HLX highest, MRBL/PTRA lowest).
- Each mock token's `signal` field (SIGNAL_STATES) was left as-authored
  and is NOT recalculated from the new score/tier — the project's own
  established design already treats signal and score-tier as
  independent (`mocks/tokens.js`'s own field-group comment: "distinct
  from the score tier label"), with reconciling them being Signal
  Engine's job (TASK 08), not this one. Some mismatch between a token's
  authored `signal` and its new computed tier (e.g. PTRA: tier IGNORE,
  signal WATCH) is expected and acceptable for now.
- The Score Engine remains fully independent of the Risk Engine
  (TASK 07, not yet implemented) — `computeScore` never reads
  `token.risk`, consistent with docs/ARCHITECTURE.md §7's "a token can
  score high and still carry high risk" principle.
- Auction scoring blends efficiency (60%) and raw completion (40%) as a
  simple, explicit V1 heuristic; liquidity uses a log scale (order-of-
  magnitude differences matter far more than small deltas at high
  liquidity) plus a small trend adjustment. Both are documented in code
  as V1, not final, matching ARCHITECTURE.md §6's own framing.

## 0.6.0 — TASK 05 (Charts)

### Added
- **Dependency added:** `recharts` (^3.10) — the first charting
  library in the project, per `docs/ARCHITECTURE.md`'s target
  `components/charts/` directory and the "no charting library" note
  carried since TASK 02.
- `mocks/priceHistory.js` — `generatePriceHistory(token)`: a
  deterministic (seeded from `token.id`, not `Math.random`) mock
  intraday price/volume series. Spans the token's real `ageMinutes`
  (6–36 points, ~5-minute buckets) and always ends exactly at that
  token's current `price`/`volume5m`, so the chart never contradicts
  the rest of the UI. This is a mock fixture generator (like
  `mocks/tokens.js`), not business logic — there is still no
  persistence layer (`docs/ARCHITECTURE.md` §5, TASK 09/10 remain
  unimplemented), so the "history" is synthesized, not stored.
- `components/charts/PriceChart.js` — area chart of the simulated
  price series.
- `components/charts/VolumeChart.js` — bar chart of the simulated 5m
  volume series (illustrative only; not reconciled against
  `volume30m`).
- `components/charts/ChartTooltip.js` — shared dark-theme tooltip
  renderer for both charts (recharts' default tooltip is a plain white
  box that clashes with the app's dark surfaces).
- `components/ui/format.js`: added `formatRelativeMinutes(minutesAgo)`
  ("now" / "-12m" / "-1.5h") for chart x-axis labels.
- `app/(app)/token/[id]/page.js`: new "PRICE" / "VOLUME (5M)" card
  section between the existing selected-token panels and Signal
  History, with an explicit "Simulated intraday history — no persisted
  snapshots yet" caption.

### Verification
- `npm run lint` — PASS, no warnings.
- `npm run build` — PASS; route table unchanged.
- Manual check: `generatePriceHistory` produces exactly 6 points for a
  14-minute-old token and 36 for a 182-minute-old one (bounds working
  as intended); the last point's price/volume equal the token's
  `price`/`volume5m` exactly for both; two calls for the same token
  return byte-identical output (confirms determinism — no
  server/client hydration mismatch risk).
- `npm run dev` — verified manually: `/token/nxa`, `/token/vlt` return
  HTTP 200 and their HTML contains a rendered
  `recharts-responsive-container`, the "PRICE"/"VOLUME (5M)" section
  headers, and the simulated-history caption; `/token/doesnotexist`
  and `/dashboard` unaffected (still HTTP 200, no server errors in the
  dev log).

### Decisions
- Charts were added only to `/token/[id]` (TASK 03), not the dashboard
  table or the Momentum/Long Auction/Microcap Score panels — those
  panels' `Meter` bar visualizations (TASK 02) represent bounded 0–100
  quantities, which a time-series chart doesn't fit; a price/volume
  history is meaningful only for a single token's own page.
- The generated history is intentionally NOT wired to the TASK 04 live
  stream — `/token/[id]` still renders a static (per-request,
  deterministic) snapshot. Combining live ticking with a growing chart
  history is a reasonable future step but wasn't requested here and
  would mix this task's scope with TASK 04's.
- No OHLC/candlestick charting, no zoom/pan, no timeframe selector —
  a single fixed intraday window keeps this task's scope to "a chart
  exists and is readable," matching Phase 1's UI/mock-engine framing.

## 0.5.0 — TASK 04 (Realtime Mock Stream)

### Added
- `lib/realtime/mockStream.js` — framework-free simulation core:
  `tickToken()`/`tickTokens()` advance a mock token by one fictional
  tick (bounded random deltas to price, market cap, liquidity — with
  `liquidityTrend` derived from the liquidity delta's sign —, 5m/30m
  volume, buy pressure, volume/buyer acceleration, unique buyers, and
  elapsed age), plus the `MOCK_STREAM_INTERVAL_MS` constant (4000ms).
  Deliberately does not touch `score`/`scoreBreakdown` (no Score
  Engine — TASK 06), `risk` (independent Risk Engine — TASK 07),
  `holders`/`top10Concentration` (holder analysis — TASK 14), or
  `auction` (Long adapter — TASK 16/17): ticking those would fake
  future engines' output rather than simulate a market feed.
- `lib/realtime/useMockLiveStream.js` — "use client" hook wrapping a
  `setInterval` that calls `tickTokens` every
  `MOCK_STREAM_INTERVAL_MS` and refreshes a clock-formatted
  `lastUpdate` string; returns `{ tokens, lastUpdate, active }`. No
  WebSocket/SSE connection exists — the realtime *mechanism* is still
  DECISION REQUIRED per `docs/ARCHITECTURE.md` §8; this is a
  client-side simulation layered on the same static mock fixtures.
- `components/dashboard/LiveDashboard.js` — new client component that
  seeds `useMockLiveStream` from the initial `mockTokens` snapshot and
  re-renders `DashboardHeader` (LIVE indicator + last-update
  timestamp), `DashboardWorkspace` (opportunities table + selected
  token panels), the metric cards, market status, and signal history
  around it.
- `components/ui/format.js`: added `formatClockTime(date)` (24h
  `HH:MM:SS`), used for the live-refreshing "Last update" timestamp.

### Changed
- `app/(app)/dashboard/page.js`: now a thin server component that
  reads `mocks/tokens.js` (still the single source of truth) and
  renders `LiveDashboard` with the initial snapshot, instead of
  assembling the dashboard sections directly.
- `components/dashboard/DashboardHeader.js`: `lastUpdate` and `active`
  are now props (defaulting to the old static `mockLastUpdate` / `true`
  for backward compatibility) instead of an imported fixture constant,
  so the live stream can drive them.
- `components/ui/LiveIndicator.js`: doc comment updated — `active` is
  now actually driven by `useMockLiveStream`, no longer a hardcoded
  mock value (the component's own code and rendering are unchanged).

### Verification
- `npm run lint` — PASS, no warnings.
- `npm run build` — PASS; route table unchanged (`/dashboard` still
  static, `/token/[id]` still dynamic).
- `npm run dev` — verified manually: `/dashboard` returns HTTP 200
  with no server-side errors; server-rendered HTML confirmed to
  contain the correct initial (un-ticked) mock values and a
  `HH:MM:SS`-formatted "Last update" timestamp that reflects the
  request time; two requests several seconds apart show the timestamp
  advancing, confirming `formatClockTime`/the hook wiring behave
  correctly server-side. The interval's client-side ticking behavior
  itself (post-hydration, in a real browser event loop) was NOT
  verified with an actual browser — no browser/screenshot tool is
  available in this environment; the `setInterval`/`setState` pattern
  follows the same idioms already used elsewhere in this codebase.

### Decisions
- No dependencies added — the "stream" is a plain `setInterval`, not a
  WebSocket/SSE client or state-management library.
- Only the opportunities table + selected-token panels and the
  header's LIVE indicator/timestamp were made live. The four top
  metric cards (`mockGlobalMetrics`) and the Market Status strip
  (`mockMarketStatus`) describe a wider market than just the 10
  fixture tokens shown in the table, and Signal History is an
  already-historical log — none of those have a well-defined live
  derivation yet, so they stay static fixtures, unchanged from
  TASK 02.
- The `/token/[id]` detail page (TASK 03) was intentionally left
  static in this task — it has no `LiveIndicator` today, so it wasn't
  part of the affordance TASK 04 closes the loop on. Wiring it to the
  same stream is a natural follow-up but was not requested.
- `lastUpdate`'s initial value now comes from the real clock
  (`formatClockTime(new Date())`) rather than the old fictional
  `"12:42:31"` fixture string, since it is driven by an actual
  `Date` from this point on. `mocks/tokens.js:mockLastUpdate` is kept
  as `DashboardHeader`'s backward-compatible default for any future
  static (non-live) usage.

## 0.4.0 — TASK 03 (Token Detail)

### Added
- `app/(app)/token/[id]/page.js` — full-page single-token deep dive.
  Looks the id up in `mocks/tokens.js`; renders the same four
  selected-token panels used on the dashboard (Token Metrics/Risk,
  Momentum, Long Auction, Microcap Score) plus a token-scoped Signal
  History filtered by symbol. Async `generateMetadata` sets the page
  title to the token's symbol.
- `components/token/TokenDetailHeader.js` — back-to-dashboard link,
  identity (symbol/name/chain/age), price, `ScoreBadge`, and
  `SignalBadge` for the full-page header.
- `components/token/TokenNotFound.js` — plain "no such token" state
  (matching `RoutePlaceholder`'s restrained style) shown when a
  `/token/[id]` URL doesn't match any mock token, instead of Next's
  default 404 page.

### Changed
- `components/dashboard/SignalHistory.js`: added optional `title`
  (default `"SIGNAL HISTORY"`) and `emptyMessage` (default
  `"No signals recorded yet."`) props, plus an explicit empty-state
  message, so the token detail page can reuse it for a filtered,
  symbol-scoped history instead of duplicating its markup. Existing
  dashboard usage is unaffected (defaults match prior hardcoded text).
- `components/dashboard/OpportunitiesTable.js`: the token symbol in
  each row is now a link to `/token/{id}` (`event.stopPropagation()`
  keeps the existing row-click selection behavior working for the
  rest of the row).

### Verification
- `npm run lint` — PASS, no warnings.
- `npm run build` — PASS; `/token/[id]` compiles as a dynamic
  (server-rendered on demand) route; all other routes unaffected.
- `npm run dev` — verified manually: `/token/nxa`, `/token/vlt`, and
  an invalid id (`/token/doesnotexist`) all return HTTP 200 with no
  server-side errors; the invalid-id case renders `TokenNotFound`
  rather than a crash or Next's default 404; `/dashboard` HTML
  confirmed to contain a working `href="/token/nxa"` link.

### Decisions
- No dependencies added, no charts (`TASK 05` untouched), no realtime
  data (`TASK 04` untouched), no Score/Risk Engine logic (`TASK
  06`/`07` untouched) — the detail page renders the same static mock
  fixtures as the dashboard, just at a dedicated URL.
- Reused `SelectedTokenPanel`, `MomentumPanel`, `LongAuctionPanel`,
  and `MicrocapScorePanel` unmodified so the dashboard's inline view
  and the full-page detail view can never show conflicting numbers
  for the same token.
- Row selection in `OpportunitiesTable`/`DashboardWorkspace` (TASK 02)
  is left as-is; the new symbol link is an additive navigation
  affordance, not a replacement for inline selection.

## 0.3.0 — TASK 02 (Dashboard)

### Added
- `mocks/tokens.js` extended per token with: `chain`, `ageMinutes`,
  `volume30m`, `holders`, `top10Concentration`, `volumeAcceleration`,
  `buyerAcceleration`, `uniqueBuyers`, `liquidityTrend`, `auction`
  (status/actual/expected/efficiency/price), `risk`
  (liquidityStatus/concentration/contractRisk/exitStatus/
  suspiciousWallets), and `scoreBreakdown` (8 components summing
  exactly to the token's `score`). New exports: `mockSignalHistory`,
  `CHAINS`, `AUCTION_STATUSES`, `SCORE_COMPONENT_MAX`,
  `SCORE_COMPONENT_LABELS`.
- `components/ui/Meter.js` — CSS-only horizontal bar meter shared by
  the Momentum, Long Auction, and Microcap Score panels.
- `components/dashboard/OpportunityFilters.js` — chain, signal,
  minimum-score, and auction-status filters plus a reset control.
  Controlled inputs; filtering logic lives in the parent.
- `components/dashboard/DashboardWorkspace.js` (client component) —
  owns filter state and selected-token state; composes the filters,
  the opportunities table, and the four selected-token panels so
  selection and filtering stay in sync without a state-management
  library.
- `components/dashboard/SelectedTokenPanel.js` — token identity,
  quantitative snapshot (market cap, liquidity, volume 30m, holders,
  top-10 concentration, buy pressure, volume/buyer acceleration), and
  a compact independent risk section.
- `components/dashboard/MomentumPanel.js` — volume acceleration,
  buyer acceleration, and buy pressure as bar meters, plus unique
  buyers and liquidity trend.
- `components/dashboard/LongAuctionPanel.js` — actual vs. expected
  auction progress, efficiency, and simulated auction price; handles
  the "no auction" (`NONE`) state.
- `components/dashboard/MicrocapScorePanel.js` — total score, tier
  label, and the full 8-component breakdown as bar meters.
- `components/dashboard/SignalHistory.js` — static recent-signals log
  rendered from `mockSignalHistory`.

### Changed
- `app/(app)/dashboard/page.js` rewritten around the TASK 02
  information architecture: header → global metrics → market status →
  opportunities (with filters) + selected-token detail → signal
  history.
- `components/dashboard/DashboardHeader.js`: added a "MOCK DATA" badge
  and a monitored-opportunities count alongside the existing LIVE
  indicator and last-update timestamp.
- `components/dashboard/MarketOverview.js`: reworked from a narrow
  vertical sidebar card into a full-width horizontal status strip to
  fit its new top-level position in the layout.
- `components/dashboard/OpportunitiesTable.js`: converted from a
  self-contained component with internal selection state into a
  controlled/presentational component (`tokens`, `selectedId`,
  `onSelectToken` props). Columns extended to TOKEN, CHAIN, AGE,
  PRICE, MC, LIQUIDITY, VOL 5M, BUY %, VOL ACCEL, SCORE, SIGNAL
  (replacing the old generic "MOMENTUM %" column with the more
  specific Volume Acceleration metric); rows sorted by score
  descending; selected row now also shows an accent marker dot in
  addition to the background highlight.
- `components/ui/format.js`: added `formatAge`, `formatMultiplier`,
  and `formatCount` helpers.

### Verification
- `npm run lint` — PASS, no warnings.
- `npm run build` — PASS; all 7 section routes plus `/` and
  `/_not-found` compile and prerender as static content.
- `npm run dev` — verified manually: `/dashboard` and all six other
  section routes return HTTP 200; dashboard HTML confirmed to contain
  every new section (MOCK DATA badge, MARKET STATUS, TOP
  OPPORTUNITIES, SELECTED TOKEN, MOMENTUM, LONG AUCTION, MICROCAP
  SCORE, SIGNAL HISTORY, filter controls); no server-side errors in
  the dev log across repeated runs.
- Responsive structure verified by inspecting rendered classes: the
  opportunities table scrolls horizontally inside its own
  `overflow-x-auto` container (never the page), and all grids
  (metrics, selected-token panels, per-panel stat grids) collapse to a
  single column below their `lg`/`xl`/`sm` breakpoints.

### Decisions
- No dependencies added — no charting library (bar meters are plain
  CSS via `Meter`), no state-management library (all filter/selection
  state is local `useState` in `DashboardWorkspace`).
- Score component weights displayed in `MicrocapScorePanel` mirror
  `docs/ARCHITECTURE.md` §6's conceptual weighting, collapsed from 9
  to 8 buckets (Narrative/Social folded into Fomo) to match this
  dashboard's display requirements. This is a display-only mock
  weighting — no Score Engine exists (TASK 06).
- Risk attributes in `SelectedTokenPanel` are presented as supplied
  mock data with no derived/calculated risk logic, consistent with
  Risk Engine being independent future scope (TASK 07).
- The default selected token is the highest-scoring token in the full
  (unfiltered) list; changing filters does not change the selection,
  only which rows are visible in the table.

## 0.2.0 — TASK 01 (UI Foundation)

### Added
- Design system tokens in `app/globals.css` (`@theme inline`): dark
  terminal background/surface/border/text scale, restrained semantic
  colors (positive/negative/warning/accent), spacing/radius scale,
  `.tabular` utility for financial numerals, visible `:focus-visible`
  ring, thin custom scrollbars, and a reduced-motion-aware
  `live-pulse` keyframe. System font stack preserved from TASK 00 (no
  Google Fonts reintroduced).
- Layout components: `components/layout/AppShell.js`,
  `Sidebar.js`, `Topbar.js`, `MobileNav.js`, and a shared
  `nav-items.js` single source of truth for the seven primary routes.
- UI kit: `components/ui/Badge.js`, `Button.js`, `Card.js`,
  `Divider.js`, `LiveIndicator.js`, `StatusIndicator.js`,
  `RoutePlaceholder.js`, and shared numeric formatters in `format.js`
  (`formatPrice`, `formatCompactUsd`, `formatPercent`).
- Dashboard components: `DashboardHeader.js`, `MetricCard.js`,
  `MarketOverview.js`, `OpportunitiesTable.js`, `ScoreBadge.js`,
  `SignalBadge.js`, `SectionHeader.js`.
- `mocks/tokens.js`: fictional global metrics, market status, ten
  fictional token fixtures, the six signal states, and the score-tier
  mapping used by `ScoreBadge`.
- Route group `app/(app)/` with a shared layout mounting `AppShell`,
  containing `/dashboard` (fully functional: header, four metric
  cards, market status panel, top-opportunities table, all from mock
  data) and six professional placeholder routes — `/scanner`,
  `/signals`, `/watchlist`, `/analytics`, `/paper-trading`,
  `/settings` — using the shared `RoutePlaceholder` component.
- `app/page.js` now redirects `/` to `/dashboard` instead of rendering
  the default Next.js starter page.

### Changed
- `app/layout.js`: page metadata updated to "Microcap Engine" /
  "Real-Time Microcap Intelligence Terminal"; body now applies the
  design-system background/text/font classes.
- `app/globals.css`: replaced the TASK 00 minimal reset with the full
  design-token system described above.

### Fixed
- Removed a stray empty literal directory,
  `components/{layout,ui,dashboard}`, left over from an earlier
  brace-expansion command that did not create the intended
  subdirectories.

### Verification
- `npm run lint` — PASS, no warnings.
- `npm run build` — PASS; `/`, `/_not-found`, `/dashboard`,
  `/scanner`, `/signals`, `/watchlist`, `/analytics`,
  `/paper-trading`, `/settings` all compile and prerender as static
  content.
- `npm run dev` — verified manually; all seven section routes and `/`
  return HTTP 200 with no console or hydration errors, and
  `/dashboard`'s rendered HTML contains the expected header, metric,
  and opportunity-table content.

### Decisions
- No dependencies added — no chart library, state library, or
  WebSocket client. Opportunity-row selection uses local component
  `useState` only.
- `OpportunitiesTable` is a client component (row selection requires
  interactivity); layout and other dashboard panels remain
  server-rendered.
- Score and signal state are always rendered as text (number + tier
  label, or state name) alongside color, never through color alone.

## 0.1.0 — TASK 00 (Audit + Initialization)

### Added
- New Next.js 16.3.4 project (App Router, JavaScript, Tailwind CSS v4,
  ESLint 9), scaffolded via `create-next-app` since no pre-existing
  project was found to audit.
- Target directory architecture: `app/{dashboard,tokens,signals,analytics,api}`,
  `components/{dashboard,tokens,charts,signals,ui}`,
  `lib/{scoring,risk,market,data,adapters,utils}`, `mocks/`, `docs/`
  (all created as empty placeholders with `.gitkeep`, no logic yet).
- `docs/ARCHITECTURE.md` — stack, adapter pattern, conceptual data
  model, Score Engine weights (V1), Risk Engine definition.
- `docs/ROADMAP.md` — full phase/task plan through TASK 22.
- `docs/MICROCAP_ENGINE_STATE.md` — current development state for
  future sessions/accounts to resume from.
- `docs/CHANGELOG.md` — this file.
- `.env.example` — empty placeholder, no variables defined yet.

### Changed
- Nothing (no pre-existing project to change).

### Fixed
- `app/layout.js` and `app/globals.css`: replaced `next/font/google`
  (Geist/Geist Mono) with a system font stack, since the build
  environment cannot reach `fonts.googleapis.com` and the default
  scaffold failed `npm run build` with a network fetch error. This is
  an environment-driven fix, not a design change; a future session
  with font-hosting access may reintroduce Google/self-hosted fonts.

### Decisions
- Used JavaScript, App Router, and Tailwind per the mandated stack;
  did not introduce TypeScript or an alternative framework.
- No dependencies added beyond `create-next-app` defaults — no
  database client, chart library, or WebSocket library installed
  until a concrete task requires them.
- No adapters, database schema, or authentication implemented — all
  explicitly out of scope for TASK 00.
