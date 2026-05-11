# notquality-app

QA portfolio platform evolving into a LeetCode-style application for quality engineers. Built by Tapesh Nagarwal (Senior QE/SDET).

---

## RULES — READ BEFORE TOUCHING ANYTHING

These are non-negotiable. Follow them on every task.

### Git
- **Never push directly to `main`.** Always create a new branch first.
- Branch naming: `feature/short-description`, `fix/short-description`, `chore/short-description`
- One branch per logical unit of work. Do not mix unrelated changes.
- Always run `git branch` to confirm which branch you are on before writing any code.
- If you are on `main`, stop and create a branch: `git checkout -b feature/your-feature-name`
- Commit messages follow: `type: short description` — types are `feat`, `fix`, `chore`, `refactor`, `docs`

### Code
- **Read the file before editing it.** Always.
- **Do not restructure folders.** The directory layout is intentional and documented below.
- **Do not install new packages without stating what you are installing and why** in your response before running the command.
- **Run `npm run build` before committing.** Fix all TypeScript errors before the commit.
- Do not add comments explaining what code does. Only add comments for non-obvious WHY reasoning or to annotate intentional bug IDs (e.g., `// BUG LG-002`).

### Intentional bugs
- **Do not fix intentional bugs.** They are documented in `data/bugs/*.json` and annotated in code with `// BUG [ID]`.
- Do not modify `data/bugs/*.json` files without being explicitly asked.
- The bug registry is the answer key for the challenge system. Treat it as sensitive.

### Auth
- There are two separate auth systems. Do not mix them.
  - **iron-session** — playground demo accounts (`legacy.user@notquality.com` etc). Handles which lab a user is in.
  - **Auth.js (NextAuth v5)** — platform users signing in with GitHub OAuth. Handles identity on the challenges platform.
- Never store plaintext passwords for real users. Demo account passwords are public by design.
- Never expose `testHint`, `actualBehavior`, or `bugIds` in any client-facing API response.

### Testability
- Every meaningful UI element must have a `data-testid` attribute.
- Naming pattern: `{context}-{element}` (e.g., `login-form`, `cart-count`, `product-card`).
- Do not remove existing `data-testid` attributes.

### Critical path
- Login, routing, session, and logout must never be broken.
- Intentional bugs live inside playground content areas only — never on the login flow or nav.

---

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
