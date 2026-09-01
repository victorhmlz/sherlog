# MICROCAP ENGINE — DEVELOPMENT STATE

**Version:** 0.1.0

**Current phase:** PHASE 0 — FOUNDATION

**Current task:** TASK 00 — AUDIT + INITIALIZATION (this task)

**Project status:** COMPLETED (TASK 00 scope only)

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

## In progress

- Nothing beyond TASK 00 scope is in progress.

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

## Next task

TASK 01 — UI FOUNDATION (not started; do not proceed automatically).

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
