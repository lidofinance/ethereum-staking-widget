# Testing

## Unit tests (Vitest)

- Runs on the Vite config (no separate config file at root); server
  workspace has its own `server/vitest.config.ts`
- Location: colocated `__tests__/` folders and `*.test.ts(x)` files
- Run: `yarn test:unit` (root + api workspace), `yarn test:unit:watch`,
  `yarn test:unit:coverage`

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

Retries on CI (2), 30s test / 5s expect timeouts, parallel, HTML + GitHub
reporters.

## Code quality

- ESLint 9 (flat config, `eslint.config.mjs`) — `yarn lint`
- stylelint (`stylelint.config.js`, see [CSS migration](./css-migration.md#linting)) — `yarn lint:css`
- Prettier; Husky pre-commit + lint-staged (staged files only)
- `yarn types` — TypeScript check (root + api workspace)

## QA debug drawer

Available only when `ENABLE_QA_HELPERS=true` (test stands; never production).

Open it with **5 quick taps on the footer** (any empty spot, not a link) or
**Ctrl+Shift+8**. The drawer provides:

- **Feature flags** — toggles from the feature-flags context, applied live.
- **QA mocks** — every localStorage override from `consts/qa-keys.ts`
  (trade guard, DG banner, security banner, amount banners, stake limit,
  Matomo logging, earn). Written to localStorage immediately; reload to
  apply ("Apply & reload"). "Reset all mocks & reload" clears everything.
- **External config mock** — "Use mocked manifest entry" checkbox + JSON
  editor. Replaces the fetched manifest entry for the current chain after
  reload. Validated with the real zod entry schema; invalid mock falls back
  to the real config with a console warning. Consumer-side clamps still
  apply. Deliberately does NOT affect the security banner: it reads the raw
  fetch result (`fetchMeta`), so `leastSafeVersion` cannot be mocked this
  way — use the dedicated security-banner mocks instead.
- **Config snapshot** — read-only JSON of the resolved `config`,
  `window.__env__`, and the external config manifest, with copy buttons.

Mock keys and their types/groups live in `consts/qa-keys.ts` — add new QA
overrides there (a unit test fails on inline key literals elsewhere).
