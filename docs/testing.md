# Testing

## Unit tests (Jest)

- Config: `jest.config.mjs`
- Transformer: `ts-jest`
- Location: `__tests__/` folders throughout the project
- Run: `yarn test:unit`

## E2E tests (Playwright)

- Config: `playwright.config.ts`
- Location: `test/`
- Run: `yarn test:e2e` or `yarn test`

### Test files

- `test/smoke.spec.ts` — API health checks
- `test/widget.spec.ts` — main widget functionality
- `test/headers.spec.ts` — security headers validation
- `test/pages/*.ts` — Page Objects for tests

### Playwright projects

- `api` — smoke tests
- `chromium`, `firefox`, `webkit` — UI tests across browsers

### Settings

- Retry on CI: 2 attempts
- Test timeout: 30 seconds
- Expect timeout: 5 seconds
- Parallel execution
- HTML + GitHub reporters

## Code quality

- ESLint: `@lidofinance/eslint-config`
- Prettier
- Husky pre-commit hooks
- lint-staged (staged files only)

## Scripts

```bash
yarn lint          # Run linter
yarn lint:fix      # Run linter with auto-fix
yarn types         # TypeScript type checking
yarn test:unit     # Run unit tests
yarn test:e2e      # Run E2E tests
```

## QA debug drawer

Available only when `ENABLE_QA_HELPERS=true` (test stands; never production).

Open it with **5 quick taps on the footer** (any empty spot, not a link) or
**Ctrl+Shift+8**. The drawer provides:

- **Feature flags** — toggles from the feature-flags context, applied live.
- **QA mocks** — every localStorage override from `consts/qa-keys.ts`
  (trade guard, DG banner, security banner, amount banners, stake limit,
  Matomo logging, earn). Values are written to localStorage immediately;
  reload the page to apply ("Apply & reload" button). "Reset all mocks &
  reload" clears everything.
- **External config mock** — "Use mocked manifest entry" checkbox + JSON
  editor. Replaces the fetched manifest entry for the current chain after
  reload (same power as intercepting the manifest response, per-browser).
  Validated with the real zod entry schema; invalid mock falls back to the
  real config with a console warning. Consumer-side clamps still apply.
  Deliberately does NOT affect the security banner: it reads the raw fetch
  result (`fetchMeta`), so `leastSafeVersion` cannot be mocked this way —
  use the dedicated security-banner mocks instead.
- **Config snapshot** — read-only JSON of the resolved `config`,
  `window.__env__`, and the external config manifest, with copy buttons.

Mock keys and their types/groups live in `consts/qa-keys.ts` — add new QA
overrides there (a unit test fails on inline key literals elsewhere).
