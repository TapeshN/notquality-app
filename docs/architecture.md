# notquality-app Architecture

## Auth and session flow

1. User opens `/login`.
2. Client submits credentials to `POST /api/auth/login`.
3. Route validates user and writes `iron-session` cookie (`notquality_session`).
4. Successful login returns a playground redirect route.
5. Protected playground routes verify session and expected playground before rendering.
6. Logout uses `POST /api/auth/logout` to destroy the session.

Critical path expectation: auth/session/routing/logout remain stable and must not host intentional bugs.

## API route map

- `POST /api/auth/login` - authenticate and set session
- `POST /api/auth/logout` - clear session
- `GET /api/products` - list products (search/category)
- `GET /api/products/:id` - product detail
- `GET /api/cart/items` - current cart
- `POST /api/cart/items` - add cart item
- `PUT /api/cart/items/:id` - update quantity
- `DELETE /api/cart/items/:id` - remove item
- `POST /api/orders` - submit order
- `GET /api/orders` - list orders
- `GET /api/orders/:id` - order detail
- `GET /api/events` - list events
- `POST /api/events` - emit event
- `GET /api/reports` - aggregated metrics
- `POST /api/test/reset` - reset seeded state (non-production)

## Event pipeline

- Domain actions emit events into `AppEvent` (via `lib/events.ts` or `/api/events`).
- Event fields include type, product/cart/order references, timestamp, and metadata JSON.
- Dashboard and reports read event counts to compute quality and conversion signals.
- Intentional event defects are tracked in `data/bugs/event-bugs.json`.

## Bug registry contract

The bug registry under `data/bugs/*.json` is source of truth for intentional defects.

Every intentional bug should include:
- `id`
- `title`
- `severity`
- `phase`
- `hint`
- `file`
- `line`

Code contract:
- in-code comment at defect location: `// BUG <ID>: ...`
- affected UI elements include stable selectors, including targeted bug selectors where needed

CI contract:
- bug registry validation checks ensure each bug ID has at least one matching `BUG <ID>` marker in source.

## Where to add things

### New pages

- Add route in `app/playgrounds/<lab>/...`.
- Protect with session checks where applicable.
- Add meaningful `data-testid` attributes for key interactions.

### New API routes

- Add handler under `app/api/<resource>/route.ts` (or nested dynamic segments).
- Keep error payloads explicit and consistent.
- Emit events if the action should appear in pipeline metrics.

### New intentional bugs

1. Add entry to the proper bug registry file in `data/bugs/`.
2. Add in-code `// BUG <ID>: ...` marker at exact defect location.
3. Add/adjust `data-testid` hooks so automation can detect/assert behavior.
4. Update playground text or docs if the new bug changes expected assertions.

### New seed data

- Update `data/seed/*.json`.
- Ensure `prisma/seed.ts` remains in sync with new fields.
- Re-run migration/seed workflow and verify `POST /api/test/reset` still restores deterministic state.
