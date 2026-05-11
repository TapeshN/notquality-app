# notquality.com

A LeetCode-style platform for Quality Engineers — built on top of a deliberately broken shopping app.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Live:** [notquality.com](https://notquality.com)

## What this is

Most QA portfolios test someone else's app. notquality.com is the app — deliberately imperfect, with 48 documented intentional bugs across UI, API, events, homepage, mobile, performance, and more (see `data/bugs/*.json`). On top of it sits a challenge system that scores users on how well they find and report the bugs.

Think LeetCode, but the problem is a live running web app and the skill being tested is QA judgment.

## What's inside

### 9 playground labs

Each lab is a different "mode" of the same shopping app, with different bug profiles activated:

| Lab | Focus |
|---|---|
| Legacy App Lab | Classic UI bugs in a storefront |
| API Services Lab | API contract violations, schema bugs |
| Event Pipeline Lab | Event ingestion, metric integrity |
| AI Quality Lab | Prompt regression, AI response evaluation |
| Flaky Test Lab | Timing issues, race conditions |
| Accessibility Lab | WCAG violations |
| Mobile & Responsive Lab | Viewport, touch targets, responsive failures |
| Performance Lab | Core Web Vitals, slow endpoints |
| Release Risk Lab | Aggregated quality signals → ship/no-ship score |

### Challenge system

The `/challenges` route lets users practice bug-finding against a specific lab. v0.1 ships the **Legacy Bug Hunt** — users explore the Legacy Lab, submit bug reports, and get a severity-weighted score against the documented bug registry.

### The bug registry

All intentional bugs are documented in `data/bugs/*.json` with ID, description, expected vs actual behavior, severity, and test hints. The same registry is the answer key for the challenge scoring engine — and a target for the [qulib](https://github.com/TapeshN/qulib) MCP server.

## Tech stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Database:** PostgreSQL via Prisma (hosted on Neon)
- **Auth:** Two systems by design
  - `iron-session` — demo playground accounts (lab environment switching)
  - `Auth.js v5` with GitHub OAuth — real platform user accounts
- **Hosting:** Vercel
- **Companion project:** [qulib](https://github.com/TapeshN/qulib) — opinionated QA scanner, also tests against this app

## Try it

### Use the live site

Visit [notquality.com](https://notquality.com), click any credential card, launch a playground. To save attempt history, sign in with GitHub and try a challenge at `/challenges`.

### Run locally

```bash
git clone https://github.com/TapeshN/notquality-app.git
cd notquality-app
cp .env.example .env
# Fill in DATABASE_URL (a Neon free-tier DB works), SESSION_SECRET, AUTH_SECRET,
# NEXTAUTH_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, NEXTAUTH_URL (see .env.example)
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:3000.

### Reset the database

```bash
npm run db:reset
```

Or hit the test reset endpoint:

```bash
curl -X POST http://localhost:3000/api/test/reset
```

This endpoint is gated to non-production environments.

## Demo accounts

These are seeded into the database. All passwords: `Test123!`

| Email | Lab |
|---|---|
| legacy.user@notquality.com | Legacy App Lab |
| api.user@notquality.com | API Services Lab |
| event.user@notquality.com | Event Pipeline Lab |
| ai.user@notquality.com | AI Quality Lab |
| flaky.user@notquality.com | Flaky Test Lab |
| a11y.user@notquality.com | Accessibility Lab |
| mobile.user@notquality.com | Mobile & Responsive Lab |
| perf.user@notquality.com | Performance Lab |
| release.user@notquality.com | Release Risk Lab |

These accounts are demo-only — credentials are intentionally public.

## Project structure

```
notquality-app/
├── app/
│   ├── api/                # API route handlers (auth, products, cart, orders, events, challenges)
│   ├── challenges/         # LeetCode-style challenge pages
│   ├── login/              # Demo account login
│   └── playgrounds/        # One folder per lab
├── components/
│   ├── auth/               # GitHub OAuth button
│   ├── landing/            # Homepage credential cards
│   └── playground/         # Shared playground shell
├── data/
│   ├── bugs/               # Bug registry (answer key for challenges)
│   └── seed/               # Accounts + product seed data
├── lib/                    # Auth, session, db, bug registry utilities
├── prisma/                 # Schema + migrations + seed script
└── types/                  # Shared TypeScript types
```

## Design principles

1. **Stable critical path** — Login, routing, and session never break. Intentional bugs live inside playground content only.
2. **Bug registry is the source of truth** — Every intentional bug has an ID. Code annotations (`// BUG LG-002`) reference the registry. Test frameworks and challenge scoring both use it.
3. **Testability is a first-class concern** — Every meaningful UI element has a `data-testid`. A `/api/test/reset` endpoint exists for CI workflows.
4. **Two auth systems, one purpose each** — Playground sessions are lab environment switching. GitHub sessions are platform identity. They never overlap.

## Companion repos

- [`qulib`](https://github.com/TapeshN/qulib) — opinionated QA scanner that can analyze this site (and any other deployed app) for honest release confidence scores
- More framework repos coming (Cypress, Playwright, API testing)

## Contributing

This is primarily a personal portfolio + product project, but bug reports and challenge ideas are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT

---

Built by [Tapesh Nagarwal](https://github.com/TapeshN). Senior Quality Engineer / SDET.
