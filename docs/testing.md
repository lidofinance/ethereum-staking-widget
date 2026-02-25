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
