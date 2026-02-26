# Lido Ethereum Staking Widget — Project Overview

## What is this?

**Lido Ethereum Liquid Staking Widget** — a web interface for participating in Ethereum staking via the Lido protocol.
Project based on Next.js 12. Deployed as a web application and/or on IPFS.

## Quick orientation

- Package manager: **yarn**
- Node: v20+

## Key directories

- `pages/` — Next.js pages (routes)
- `features/` — vertical feature modules (stake, withdrawals, earn, wsteth, rewards, referral, settings, ipfs)
- `modules/web3/` — web3 providers and hooks (wagmi/reef-knot)
- `providers/` — React context providers
- `shared/` — reusable components and hooks
- `config/` — application configuration (ConfigProvider, feature flags, networks)
- `consts/` — constants (chains, API endpoints, react-query strategies)
- `networks/*.json` — contract addresses per network (mainnet, sepolia, holesky)
- `abi/` — smart contract ABIs
- `utilsApi/` — server-side utilities for API routes
- `ipfs.json` — IPFS deployment config (feature flags per chain, vault configs, CIDs)

## Detailed docs

- [Architecture & patterns](./architecture.md)
- [Features & flows](./features.md)
- [Config & env vars](./config.md)
- [Testing](./testing.md)
