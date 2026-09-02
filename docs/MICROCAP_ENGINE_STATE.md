# MICROCAP ENGINE — DEVELOPMENT STATE

**Version:** 0.2.0

**Current phase:** PHASE 1 — UI / MOCK ENGINE

**Current task:** TASK 01 — UI FOUNDATION

**Project status:** COMPLETED

## Completed

- Fresh Next.js 16.3.4 project scaffolded (App Router, JavaScript,
  Tailwind CSS v4, ESLint 9) — no pre-existing project was found to
  audit, so TASK 00 initialized one from scratch instead.
- Target directory architecture created under `app/`, `components/`,
  `lib/`, `mocks/`, `docs/` (empty placeholders, no business logic yet).
- `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`,
  `docs/MICROCAP_ENGINE_STATE.md`, `docs/CHANGELOG.md` created.
- `npm run build` and `npm run lint` both verified passing on the
  scaffolded project (after fixing a Google Fonts network dependency
  that failed the build in this sandbox — see CHANGELOG).
- `.env.example` created (empty — no environment variables are in use
  yet since no adapters/database exist).
- Design system: dark terminal color tokens, spacing/radius scale,
  tabular-numeral utility, focus-visible ring, thin scrollbars, and a
  reduced-motion-aware live-pulse keyframe centralized in
  `app/globals.css` (`@theme inline`), consumed via Tailwind utility
  classes — no hardcoded hex values in components.
- Application shell: `AppShell`, `Sidebar`, `Topbar`, `MobileNav`,
  shared `nav-items.js` — desktop/tablet persistent sidebar, mobile
  bottom nav strip, `LiveIndicator` in the topbar.
- Route group `app/(app)/` wraps all seven primary sections in
  `AppShell` via a single layout: `/dashboard`, `/scanner`,
  `/signals`, `/watchlist`, `/analytics`, `/paper-trading`,
  `/settings`. Root `/` redirects to `/dashboard`.
- `/dashboard` is fully functional per TASK 01 scope: header with mock
  live/last-update state, four global metric cards, a market status
  panel, and the top-opportunities table — all sourced from
  `mocks/tokens.js`, never hardcoded in presentation components.
- `OpportunitiesTable`: keyboard-accessible, locally selectable rows
  (no token-detail navigation yet), horizontal scroll contained to the
  table on small viewports.
- `ScoreBadge` / `SignalBadge`: score and signal state are always shown
  as text (number + tier label / state name), never through color
  alone.
- The six remaining routes (`scanner`, `signals`, `watchlist`,
  `analytics`, `paper-trading`, `settings`) render a shared
  `RoutePlaceholder` — a plain "coming in a future task" state, not a
  broken or empty page.
- `npm run lint` and `npm run build` verified passing; all 7 section
  routes plus `/` and `/_not-found` compile and prerender as static
  content. `npm run dev` verified serving `/dashboard` and all other
  routes with 200 responses and no console/hydration errors.
- No dependencies added beyond the TASK 00 baseline.

## In progress

- Nothing beyond TASK 01 scope is in progress.

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
- TASK 01 is UI-only. There is still no Score Engine, Risk Engine,
  database, blockchain/RPC integration, Long/Fomo integration,
  WebSocket/SSE realtime stream, wallet connection, or trading
  execution of any kind. All dashboard values are static mock fixtures
  from `mocks/tokens.js`.

## Next task

TASK 02 — DASHBOARD (not started; do not proceed automatically).
