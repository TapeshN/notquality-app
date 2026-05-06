# notquality.com — Project Plan

Built by Tapesh Nagarwal (Senior Quality Engineer / Senior SDET, ~7 years experience).

notquality.com is a hosted, deliberately imperfect application designed as the target system for a portfolio of QA and test automation frameworks. The app simulates enterprise-grade complexity across UI, API, event pipeline, AI, accessibility, flaky behavior, and release confidence domains.

---

## Architecture

### Design Principles

1. **One app, multiple bug profiles.** Each playground account activates a different set of intentional issues via a bug registry. The underlying app is the same.
2. **Stable critical path, intentionally buggy playgrounds.** Login, routing, and session never break. Bugs live inside playground content areas.
3. **Testability is a first-class feature.** `data-testid` attributes are planned up front. A test reset endpoint (`POST /api/test/reset`) enables deterministic CI runs. Correlation IDs thread through API responses, events, and DB records.
4. **Bug registry is the source of truth.** Every intentional bug has an ID, description, expected/actual behavior, severity, and test hint. Code is annotated with bug IDs. Test frameworks assert against the registry.

### Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | Next.js 16 App Router + TypeScript | Full-stack in one repo, file-based routing, server components |
| Styling | Tailwind CSS | Fast, utility-first, no runtime overhead |
| ORM | Prisma + PostgreSQL | Type-safe queries, migration tooling, easy seed/reset |
| Auth | iron-session (encrypted cookies) | Lightweight demo auth, no OAuth complexity needed |
| Hosting | Vercel (app) + Neon (DB) | Zero-config deploy, free tier, preview URLs per branch |

### Database Models

- **User** — seeded demo accounts, one per playground
- **Product** — 10 seeded products across 3 categories, one inactive (intentional bug)
- **Cart / CartItem** — user cart with intentional duplicate row bug
- **Order / OrderItem** — order history with inventory decrement bug
- **AppEvent** — event store for pipeline validation (all user actions emit events)
- **Metric** — aggregated counters for dashboard validation

---

## Playground Accounts

| Account | Playground | Route |
|---|---|---|
| legacy.user@notquality.com | Legacy App Lab | /playgrounds/legacy |
| api.user@notquality.com | API Services Lab | /playgrounds/api-services |
| event.user@notquality.com | Event Pipeline Lab | /playgrounds/event-pipeline |
| ai.user@notquality.com | AI Quality Lab | /playgrounds/ai-quality |
| flaky.user@notquality.com | Flaky Test Lab | /playgrounds/flaky |
| a11y.user@notquality.com | Accessibility Lab | /playgrounds/accessibility |
| release.user@notquality.com | Release Risk Lab | /playgrounds/release-risk |

All passwords: `Test123!`

---

## Bug Registry Summary

Bugs are defined in `data/bugs/*.json`. Every bug has:
- `id` — unique identifier (e.g., `LG-003`, `API-001`, `EVT-002`)
- `playground` — which lab it belongs to
- `type` — category (visual, api, event, validation, accessibility, etc.)
- `description` — what is wrong
- `expectedBehavior` — what should happen
- `actualBehavior` — what actually happens
- `severity` — low / medium / high
- `testHint` — specific assertion guidance for test frameworks

| File | Count | Covers |
|---|---|---|
| `homepage-bugs.json` | 8 | HP-001 to HP-008 |
| `legacy-bugs.json` | 10 | LG-001 to LG-010 |
| `api-bugs.json` | 8 | API-001 to API-008 |
| `event-bugs.json` | 7 | EVT-001 to EVT-007 |

---

## API Endpoints

All endpoints are in `app/api/`.

| Method | Path | Description |
|---|---|---|
| POST | /api/auth/login | Authenticate, set session, return redirect URL |
| POST | /api/auth/logout | Destroy session |
| GET | /api/products | List products (search, category filter) |
| GET | /api/products/:id | Get product detail |
| GET | /api/cart/items | Get current user's cart |
| POST | /api/cart/items | Add item to cart |
| PUT | /api/cart/items/:id | Update item quantity |
| DELETE | /api/cart/items/:id | Remove item from cart |
| POST | /api/orders | Submit order from cart |
| GET | /api/orders | List user's orders |
| GET | /api/orders/:id | Get order detail |
| POST | /api/events | Emit a custom event |
| GET | /api/events | List user's events |
| GET | /api/reports | Aggregated metrics for dashboard |
| POST | /api/test/reset | Reset all user data (non-production only) |

---

## Phase Roadmap

### Phase 1 — Landing Page + Login ✅ (scaffolded)
- [x] Public homepage with hero copy
- [x] Credential cards (one per playground, click to prefill login)
- [x] Login form with email/password prefill via query params
- [x] Account-based routing on login
- [x] Logout
- [x] Random homepage bug system (HP-001 to HP-008)
- [x] `HomepageBugOverlay` exposes active bug ID for test frameworks

**Unlock:** Test frameworks can validate login flow, credential cards, bug injection

---

### Phase 2 — Legacy App Lab (MVP)
Build the first real playground: a classic product catalog and shopping flow.

#### Pages to build
- [ ] `/playgrounds/legacy/products` — product listing with search + category filter
- [ ] `/playgrounds/legacy/products/[id]` — product detail page
- [ ] `/playgrounds/legacy/cart` — cart with quantity controls
- [ ] `/playgrounds/legacy/orders` — order history table
- [ ] `/playgrounds/legacy/dashboard` — basic metrics display

#### Core user flow
```
Login → Search products → View detail → Add to cart → Update quantity → Submit order → View in orders → Dashboard reflects data
```

#### Intentional bugs to activate (from legacy-bugs.json)
- LG-001: Duplicate "Add" button text, no aria-label
- LG-002: Cart count does not update without refresh
- LG-003: Price mismatch between listing and detail page
- LG-004: Product images missing alt text
- LG-005: Filter state persists in UI but not in results
- LG-006: Order history sorts by date string, not date value
- LG-007: Cart drawer does not trap focus
- LG-008: Success toast fires before API confirms order
- LG-009: Grid collapses too early on tablet
- LG-010: Cart accepts quantity 0

#### Nav component
- Link bar: Products | Cart (with count badge) | Orders | Dashboard
- Cart count badge: intentionally stale (LG-002)

**Unlock:** `notquality-cypress-framework` — UI automation, selector strategy, state bugs, visual checks

---

### Phase 3 — API Services Lab
Display the API contract, expose known violations interactively.

#### Pages to build
- [ ] `/playgrounds/api-services` — endpoint explorer, known issues list (shell already exists)
- [ ] Request/response viewer (send requests from the browser, see raw responses)

#### What already works
- All API endpoints are live and contain intentional bugs (API-001 to API-008)
- Bug registry is loaded and displayed in the shell page

**Unlock:** `notquality-api-test-framework` — contract testing, negative testing, schema validation

---

### Phase 4 — Event Pipeline Lab
Validate that shopping actions produce correct events and downstream metrics.

#### Pages to build
- [ ] `/playgrounds/event-pipeline` — event stream viewer
- [ ] Event log table with type, timestamp, payload
- [ ] Metrics aggregation dashboard
- [ ] Manual event trigger UI for testing

#### Intentional bugs to activate (from event-bugs.json)
- EVT-001: Duplicate cart events
- EVT-002: PRODUCT_VIEWED missing productId
- EVT-003: Timestamp in wrong timezone
- EVT-004: Price in event payload uses base price not sale price
- EVT-005: ORDER_SUBMITTED fires on failure
- EVT-006: Dashboard cache doesn't reflect new events
- EVT-007: Search events grouped under wrong category

**Unlock:** `notquality-event-validation-framework` — event store assertions, ETL testing, metric validation

---

### Phase 5 — Accessibility Lab + Flaky Test Lab
Two lighter playgrounds that demonstrate specific testing patterns.

#### Accessibility Lab
- [ ] Render a page with known WCAG violations (missing labels, broken tab order, low contrast, modal focus trap)
- [ ] Each violation is documented and tagged in the DOM

#### Flaky Test Lab
- [ ] Random API delays (100ms–3000ms)
- [ ] Intermittent 500 responses on a specific endpoint
- [ ] Race condition between UI state and API response
- [ ] Order-dependent test data

**Unlock:** `notquality-accessibility-framework`, flaky test mitigation examples

---

### Phase 6 — AI Quality Lab
Mock AI tutor or content assistant with evaluatable outputs.

- [ ] Prompt input form
- [ ] Response display
- [ ] Rubric scoring UI
- [ ] Golden dataset examples
- [ ] Intentional flaws: hallucinated answers, inconsistent tone, wrong reading level, prompt injection

**Unlock:** `notquality-ai-eval-framework`

---

### Phase 7 — Release Risk Lab
Aggregates quality signals from all labs into a release confidence score.

- [ ] Input panel: UI pass rate, API failures, flaky rate, a11y score, event errors, AI score, open critical bugs
- [ ] Release confidence score (0–100%)
- [ ] Recommendation: Green / Proceed with caution / Hold
- [ ] Primary risk breakdown

**Unlock:** `notquality-release-confidence-framework`, senior QE interview story

---

## GitHub Repository Strategy

| Repo | Purpose |
|---|---|
| `notquality-app` | This repo — the hosted target application |
| `notquality-cypress-framework` | UI and E2E automation against Legacy App Lab |
| `notquality-api-test-framework` | API contract, negative, and integration tests |
| `notquality-event-validation-framework` | Event store, DB, aggregation, and metric validation |
| `notquality-ai-eval-framework` | Prompt regression, golden datasets, rubric scoring |
| `notquality-accessibility-framework` | axe-core, keyboard nav, Lighthouse, manual charters |
| `notquality-release-confidence-framework` | Quality signal scoring and release recommendation |

---

## Setup Commands

```bash
# Install
npm install

# Environment
cp .env.example .env
# Set DATABASE_URL and SESSION_SECRET in .env

# Database
npm run db:migrate    # run migrations
npm run db:seed       # seed accounts and products
npm run db:studio     # open Prisma Studio (GUI)

# Dev
npm run dev           # start on localhost:3000

# Test reset (CI / automation)
curl -X POST http://localhost:3000/api/test/reset
```

---

## Interview Story (when this is complete)

> "I built notquality.com as a hosted QA playground that simulates legacy UI workflows, API contract violations, event pipeline bugs, AI response evaluation, accessibility defects, flaky automation scenarios, and release risk decisions.
>
> The app has a bug registry — every intentional issue has an ID, documented expected vs actual behavior, and a test hint. My test frameworks assert against that registry rather than hardcoding expectations.
>
> The release risk lab aggregates quality signals from every other lab and produces a release confidence score. That's the capstone — it shows I think about quality holistically, not just whether tests pass."
