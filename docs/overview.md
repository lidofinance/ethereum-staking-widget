# Lido Ethereum Staking Widget — Project Overview

## What is this?

**Lido Ethereum Liquid Staking Widget** — a web interface for Ethereum staking via the Lido protocol.
Vite + React SPA (no SSR) with a Fastify API workspace. Deployed as a web app and/or on IPFS.

## Quick orientation

- **yarn** workspaces (root = web, `server/` = api)
- Node: v20+
- Dev: `yarn dev` (web + api)

## Key directories

- `app/` — entry, router, route components
- `features/` — vertical feature modules (stake, withdrawals, earn, wsteth, rewards, …)
- `modules/web3/` — web3 providers and hooks (wagmi/reef-knot)
- `providers/` — React context providers
- `shared/` — reusable components and hooks
- `config/` — ConfigProvider, feature flags, client-env manifest
- `consts/` — constants (chains, endpoints, query strategies)
- `networks/*.json` — addresses per network
- `abi/` — contract ABIs
- `server/` — Fastify API (`/api/*`)
- `scripts/` — Vite plugins, head prerender
- `styles/`, `shims/` — global styles/tokens; shims
- `REMOTE_CONFIG_MANIFEST.json` — remote config (flags, vaults, CIDs)

## Detailed docs

- [Architecture & patterns](./architecture.md)
- [CSS migration (styled-components → CSS modules)](./css-migration.md)
- [Features & flows](./features.md)
- [Config & env vars](./config.md)
- [Testing](./testing.md)
