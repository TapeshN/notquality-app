# Cursor Onboarding Prompt — notquality-app

Copy and paste everything below this line into Cursor chat to get started.

---

## Context

I am building **notquality.com** — a hosted, deliberately imperfect shopping application that serves as the target system for a portfolio of QA and test automation frameworks. I am a Senior Quality Engineer / Senior SDET with ~7 years of experience. This project is meant to demonstrate senior-level thinking across UI automation, API contract testing, event pipeline validation, accessibility, flaky test mitigation, and release confidence.

The app is already scaffolded. Do not re-scaffold or restructure. Read the existing files before writing anything.

Key files to read first:
- `PROJECT_PLAN.md` — full roadmap, architecture decisions, phase breakdown
- `CLAUDE.md` — conventions, directory structure, testability rules
- `prisma/schema.prisma` — database models
- `types/index.ts` — shared TypeScript types
- `data/bugs/legacy-bugs.json` — intentional bugs for the Legacy App Lab
- `data/seed/accounts.json` — playground accounts and routing
- `lib/bugs.ts`, `lib/events.ts`, `lib/session.ts`, `lib/accounts.ts` — core utilities

## Stack

- Next.js 16 App Router, TypeScript, Tailwind CSS
- Prisma + PostgreSQL
- iron-session (cookie auth)

## Rules — follow these exactly

1. **Read before writing.** Always read the relevant existing file before editing it.
2. **Do not change the folder structure.** It is intentional and documented in CLAUDE.md.
3. **Use `data-testid` attributes on every meaningful UI element.** Naming pattern: `{context}-{element}` (e.g., `product-card`, `cart-count`, `order-row`). This is non-negotiable — the whole point of the app is testability.
4. **All intentional bugs must have a comment referencing the bug ID.** Example: `// BUG LG-002: cart count does not update without refresh`. Do not fix intentional bugs.
5. **Do not add comments explaining what code does.** Only add comments when the WHY is non-obvious, or to mark a bug ID.
6. **Do not install new packages without asking first.**
7. **The critical path must stay stable.** Login, session, routing, and logout should never be broken by playground bugs.
8. **The test reset endpoint (`POST /api/test/reset`) must work after every change** that touches orders, cart, events, or products.

## Current status

The scaffold is complete:
- Landing page with credential cards and random homepage bug injection
- Login page with prefill support
- All API routes: auth, products, cart, orders, events, reports, test/reset
- Prisma schema with all 6 models
- Bug registry: 33 documented intentional bugs across HP, LG, API, EVT
- Playground shells for all 7 labs (most are "Coming in Phase X" placeholders)

## What to build next — Phase 2: Legacy App Lab

Build the shopping flow for the Legacy App Lab. This is the highest priority and the foundation for the Cypress/Playwright test framework.

### Pages to build

All pages live under `app/playgrounds/legacy/`.

#### 1. `/playgrounds/legacy/products` — Product Listing

- Fetch products from `GET /api/products`
- Display product cards in a grid: name, image, price, category, rating, vendor
- Search input (calls `?search=`) and category filter dropdown (calls `?category=`)
- "Add to Cart" button on each card — calls `POST /api/cart/items`
- Nav bar with: Products | Cart (with cart count badge) | Orders | Dashboard
- **BUG LG-001:** Multiple "Add" buttons with no aria-label (duplicate text, no context)
- **BUG LG-002:** Cart count badge does not update after adding item (stays stale until refresh)
- **BUG LG-004:** Product images rendered with empty or missing alt attribute
- **BUG LG-005:** Category filter UI shows active state but results do not re-filter on back-navigation
- **BUG LG-009:** Grid collapses to single column at 800px instead of 768px

Required `data-testid` attributes:
- `product-grid` — the grid container
- `product-card` — each product card
- `product-name`, `product-price`, `product-image`, `product-category`, `product-rating` — within each card
- `add-to-cart-btn` — the add button on each card
- `cart-count` — the badge in the nav
- `search-input` — the search field
- `category-filter` — the category dropdown
- `legacy-nav` — the nav bar

#### 2. `/playgrounds/legacy/products/[id]` — Product Detail

- Fetch product from `GET /api/products/:id`
- Display full product info: name, image, description, price, inventory, rating, vendor
- "Add to Cart" button
- **BUG LG-003:** Price shown on this page will differ from the listing page (API intentionally returns sale price as price on detail endpoint — this is already coded in `app/api/products/[id]/route.ts`)
- **BUG LG-004:** Image missing alt text

Required `data-testid` attributes:
- `product-detail` — page wrapper
- `detail-name`, `detail-price`, `detail-description`, `detail-image`, `detail-inventory`, `detail-rating`
- `detail-add-to-cart`

#### 3. `/playgrounds/legacy/cart` — Cart

- Fetch cart from `GET /api/cart/items`
- Display cart items: product name, quantity input, price per item, line total
- Quantity update calls `PUT /api/cart/items/:id`
- Remove item calls `DELETE /api/cart/items/:id`
- Cart total at bottom
- "Submit Order" button — calls `POST /api/orders`
- **BUG LG-007:** Cart drawer/panel does not trap focus (Tab key escapes to background)
- **BUG LG-008:** Success toast appears immediately on submit click, before API response returns
- **BUG LG-010:** Quantity field accepts 0 without validation error (no client-side guard)

Required `data-testid` attributes:
- `cart-container`
- `cart-item` — each row
- `cart-item-name`, `cart-item-quantity`, `cart-item-price`, `cart-item-total`
- `cart-item-remove`
- `cart-total`
- `submit-order-btn`
- `order-success-toast`

#### 4. `/playgrounds/legacy/orders` — Order History

- Fetch orders from `GET /api/orders`
- Display in a table: order ID, date, status, total, item count
- Clicking a row expands order items
- **BUG LG-006:** Table sorts by date string alphabetically instead of chronologically when date column header is clicked

Required `data-testid` attributes:
- `orders-table`
- `order-row` — each row
- `order-id`, `order-date`, `order-status`, `order-total`
- `order-sort-date` — the date column header (clicking this triggers the sort bug)

#### 5. `/playgrounds/legacy/dashboard` — Metrics

- Fetch from `GET /api/reports`
- Display: total products viewed, total searches, total cart adds, total orders, total failures, conversion rate
- Simple stat cards layout
- Note: cart adds will be inflated due to BUG EVT-001 (duplicate events) — this is intentional

Required `data-testid` attributes:
- `dashboard-container`
- `metric-views`, `metric-searches`, `metric-cart-adds`, `metric-orders`, `metric-failures`, `metric-conversion`

### Shared Legacy Nav component

Create `components/playground/LegacyNav.tsx`:
- Links: Products, Cart (with count badge), Orders, Dashboard
- Cart count fetched from `GET /api/cart/items` on mount
- **BUG LG-002:** Count does not reactively update after adding item — it only reflects the count at page load

### Event emission

When a user views a product detail page, emit a `PRODUCT_VIEWED` event via `POST /api/events`.
When a user submits a search, emit a `PRODUCT_SEARCHED` event.
Use the existing `lib/events.ts` utility for server-side emission, or call `POST /api/events` from the client.

Note: `ITEM_ADDED_TO_CART` is already emitted in `app/api/cart/items/route.ts`.

## After Phase 2 is done

Check `PROJECT_PLAN.md` Phase 3 for the next steps (API Services Lab interactive request viewer).

Do not start Phase 3 until Phase 2 is complete and I have reviewed it.
