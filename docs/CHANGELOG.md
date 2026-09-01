# CHANGELOG

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
