# CHANGELOG

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
