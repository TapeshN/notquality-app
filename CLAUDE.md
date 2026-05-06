# notquality-app

QA portfolio platform — a deliberately imperfect shopping application used as a target system for testing frameworks.

## Stack
- Next.js 16 App Router, TypeScript, Tailwind CSS
- PostgreSQL via Prisma ORM
- iron-session for cookie-based auth

## Setup

```bash
cp .env.example .env        # fill in DATABASE_URL and SESSION_SECRET
npm install
npm run db:migrate          # run migrations
npm run db:seed             # seed users and products
npm run dev                 # start dev server on localhost:3000
```

## Key concepts

**Bug registry** — intentional bugs are documented in `data/bugs/*.json` with IDs, descriptions, and test hints. Every bug in code has a matching comment referencing its ID (e.g., `// BUG LG-002`).

**Critical path** — login, routing, and playground shells are stable by design. Bugs live inside playground content areas only.

**Homepage bugs** — one random bug is selected per page load via `lib/bugs.ts:getRandomHomepageBugId()`. The active bug ID is exposed at `[data-testid="active-homepage-bug"]` for test frameworks to read.

**Test reset endpoint** — `POST /api/test/reset` clears all user-generated data and resets inventory to seeded values. Not available in production.

## Testability conventions

All meaningful UI elements have `data-testid` attributes. Naming pattern: `{context}-{element}` (e.g., `login-form`, `cart-count`, `product-card`).

## Directory structure

```
app/
  api/              API route handlers
  login/            Login page
  playgrounds/      One directory per playground lab
components/
  landing/          Homepage components (CredentialCard, HomepageBugOverlay)
  playground/       Shared playground shell and nav
data/
  bugs/             Bug registry JSON files (source of truth for test assertions)
  seed/             Seed data for accounts and products
lib/
  accounts.ts       Playground account registry
  bugs.ts           Bug registry utilities
  db.ts             Prisma client singleton
  events.ts         Event emission utility
  session.ts        iron-session configuration
prisma/
  schema.prisma     Database schema
  seed.ts           Seed script
types/
  index.ts          Shared TypeScript types
```
