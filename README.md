# Lido Ethereum Liquid Staking Widget

A widget for submitting Ether to the pool based on [Lido Frontend Template](https://github.com/lidofinance/lido-frontend-template).

### Pre-requisites

- Node.js v16+
- Yarn package manager

This project requires an .env file which is distributed via private communication channels. A sample can be found in .env.

### Development

Step 1. Copy the contents of `sample.env` to `.env.local`

```bash
cp sample.env .env.local
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

### Environment variables

Note! Avoid using `NEXT_PUBLIC_` environment variables as it hinders our CI pipeline. Please use server-side environment variables and pass them to the client using `getInitialProps` in `_app.js`.

### Automatic versioning

Note! This repo uses automatic versioning, please follow the [commit message conventions](https://www.conventionalcommits.org/en/v1.0.0/).

e.g.

```
git commit -m "fix: a bug in calculation"
git commit -m "feat: dark theme"
```

## Production

```bash
yarn build && yarn start
```

## Adding a new route API

- create a new file in `pages/api/` folder
- use `wrapRequest` function from `utilsApi/apiWrappers.ts`
- use default wrappers from `utilsApi/apiWrappers.ts` if needed (e.g. `defaultErrorHandler` for handle errors)

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

Learn more about [App Release Flow](https://www.notion.so/App-Release-Flow-f8a3484deecb40cb9d8da4d82c1afe96).
