# CHANGELOG

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
