# Contributing to notquality-app

Thanks for contributing. This project is intentionally designed with known defects so QA and automation frameworks can validate real-world failure modes.

## Project overview

`notquality-app` is the target application for multiple testing frameworks. The app includes both stable critical flows and intentional bugs documented in the bug registry under `data/bugs/*.json`.

Critical path must remain stable:
- login/session
- routing
- logout

Playground content may contain intentional defects by design.

## Local setup

1. Copy environment file and set values:

```bash
cp .env.example .env
```

2. Run a full setup bootstrap:

```bash
npm run setup
```

`setup` runs install, db migration, db seed, and a quick sanity check.

## Intentional bug contract (CI enforced)

Every intentional bug MUST include all three:

1. Bug registry entry in `data/bugs/*.json` including:
   - `id`
   - `title`
   - `severity`
   - `phase`
   - `hint`
   - `file`
   - `line`
2. In-code marker at the defect location:
   - `// BUG <ID>: description`
3. Test targeting hook on affected UI:
   - `data-testid="bug-<id>-<element>"`

Any violation of the contract is treated as a failing contribution and should be considered a CI blocker.

## Branch naming conventions

- `feat/<short-description>`
- `fix/<short-description>`
- `docs/<short-description>`
- `chore/<short-description>`

Examples:
- `feat/phase-4-event-filter-controls`
- `fix/login-prerender-error`
- `docs/update-architecture`

## Commit message format

Use conventional commits:

- `feat: ...`
- `fix: ...`
- `docs: ...`
- `chore: ...`
- `test: ...`
- `refactor: ...`

Examples:
- `feat: add event stream filter buttons`
- `fix: align event metadata type with Prisma JSON input`

## Pull request checklist

Before requesting review, confirm:

- [ ] Linked issue is included in PR description
- [ ] Lint, typecheck, and build pass locally
- [ ] Bug IDs are referenced for intentional bug changes
- [ ] `data-testid` attributes were added for meaningful UI changes
- [ ] I did not accidentally modify stable critical-path behavior
- [ ] Screenshots or recordings are included for UI changes
- [ ] Test plan is documented (manual and/or automated)

## Important warning

## Do not fix intentional bugs unless the linked issue explicitly says to.

If you suspect an intentional bug should be changed, discuss first in an issue and reference the specific bug ID(s).
