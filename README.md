# Lido Ethereum Liquid Staking Widget

A widget for submitting Ether to the pool based on [Lido Frontend Template](https://github.com/lidofinance/lido-frontend-template).

**Documentation:** [Overview](docs/overview.md) — entry point for architecture, config, features, and testing.

### Prerequisites

- Node.js v20+ (CI builds on Node 24)
- Yarn package manager v1

This project requires an .env file which is distributed via private communication channels. A sample can be found in .env.example

### Development

Step 1. Copy the contents of `.env.example` to `.env.local`

```bash
cp .env.example .env.local
```

Step 2. Fill out the `.env.local`. You will need to provide RPC provider urls with keys included.

Step 3. Install dependencies

```bash
yarn install
```

Step 4. Start the development server

```bash
yarn dev
```

for IPFS mode below:

```bash
yarn dev:ipfs # will start with HMR
```

### Environment variables

Frontend runtime env has a single source of truth: `config/client-env-manifest.ts` —
adding an entry there is the only step needed to expose a new env var to the
browser config (see `docs/config.md` for the delivery mechanism). Server-only
env is read by the api workspace (`server/src/config.ts`) and never reaches
the browser.

### Automatic versioning

Note! This repo uses automatic versioning, please follow the [commit message conventions](https://www.conventionalcommits.org/en/v1.0.0/).

e.g.

```
git commit -m "fix: a bug in calculation"
git commit -m "feat: dark theme"
```

## Production build locally

Runs the same containers k8s runs (`Dockerfile.web` + `Dockerfile.api`),
wired like the helm release: nginx serves the static build, splices runtime
env into the HTML via SSI, and proxies `/api/*` to the api container. Env is
read from `.env.local` — the same file `yarn dev` uses — at container boot:

```bash
docker compose up --build
# → http://localhost:3000
```

Env-only changes need no rebuild: edit `.env.local` and `docker compose up`
again. See `compose.yaml` for the local-only overrides (file-mount features
are disabled by default) and `docs/config.md` for how runtime env reaches
the browser.

For the static IPFS bundle:

```bash
yarn build:ipfs # emits dist/
```

## Adding a new route API

**Deprecated: do not add new endpoints to next api**

- create a new file in `pages/api/` folder
- use `wrapRequest` function from `@lidofinance/next-api-wrapper` package.
- use default wrappers from `utilsApi/nextApiWrappers.ts` if needed (e.g. `defaultErrorHandler` for handle errors)

**Example:**

```ts
const someRequest: API = async (req, res) => await fetch();

export default wrapRequest([defaultErrorHandler])(someRequest);
```

## Release flow

To create a new release:

1. Merge all changes to the `main` branch.
1. After the merge, the `Prepare release draft` action will run automatically. When the action is complete, a release draft is created.
1. When you need to release, go to Repo → Releases.
1. Publish the desired release draft manually by clicking the edit button - this release is now the `Latest Published`.
1. After publication, the action to create a release bump will be triggered automatically.
