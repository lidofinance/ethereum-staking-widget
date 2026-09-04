# Architecture & Patterns

## Stack

- **Vite 8** (rolldown) — pure SPA, no SSR (rationale: `vite.config.ts` header)
- **React 18** + **React Router 7** (library mode; hash router on IPFS)
- **TypeScript 6**
- **wagmi 3** + **viem 2** — Ethereum interaction
- **Reef Knot 8** — wallet connection layer
- **@lidofinance/lido-ethereum-sdk 4** — Lido SDK
- **@tanstack/react-query 5** — server state/caching
- **React Hook Form 7** + **Zod** — forms and validation
- **CSS modules + PostCSS** (styled-components 5 legacy — see [CSS migration](./css-migration.md))
- **@lidofinance/lido-ui** — Lido design system
- **Fastify 5** — API workspace (`server/`)

## App entry & providers

```
index.html → app/main.tsx (createRoot, no hydration)
  HelmetProvider → RouterProvider (app/router.tsx — lazy route chunks)
    → app/router-layout.tsx (Fonts, LidoUIHead) → providers/index.tsx:
      QueryClient → AppFlag → Config → CookieTheme (+ GlobalStyle)
        → Web3 (wagmi + reef-knot) → modal / navigation / feature providers
```

## Architectural patterns

### Feature modules (features/)

Vertical slices: each folder contains everything for its feature —
components, hooks, utils, types. Imported via barrel index files.

### Custom hooks

- Data: `useQuery`/`useMutation` (strategies: `consts/react-query-strategies.ts`)
- Web3: `useBalance`, `useAllowance`, `useContractAddress` (`modules/web3/hooks/`)
- Forms: `useFormContext`, `useWatch`; transactions: `useTxFlow` (modal flow)

### Transaction flow

1. Form → zod validation → transaction modal (`shared/transaction-modal/`)
2. Approval step (if allowance is required) → submission
3. Waiting for confirmation

Account Abstraction (ERC-4337, safe-global) via reef-knot.

### Multi-network support

- Chain configuration: `config/networks/`
- Contract addresses per network: `networks/*.json`
- RPC per chain via env vars: `EL_RPC_URLS_{CHAIN_ID}`

### Feature flags

- `config/feature-flags/` — flag definitions
- External config loaded from IPFS/CDN at runtime
- `REMOTE_CONFIG_MANIFEST.json` — static per-chain overrides
- Flags can disable entire pages

### SEO / prerender

`vite-prerender-plugin` + `scripts/prerender.ts` emit per-route `<head>`
(meta from `shared/seo.ts`) into static per-route HTML at build time —
head-only; the body stays the SPA bootstrap, never hydrated. Plus sitemap
and JSON-LD plugins. Runtime head: react-helmet-async.

### IPFS mode

- Build: `yarn build:ipfs` (`IPFS_MODE=true`; `__IPFS_MODE__` define)
- Relative base (`./`), hash routing, static head + CSP meta
- SRI via static modulepreload links (no import map)

### API (server/ workspace)

Fastify app (`server/src/routes/`): health, metrics, RPC proxy (hides
credentials, method allowlisting), config-manifest/validation proxies,
rewards, earn APR/TVL (LRU-cached), geo, CSP report. Rate-limited.

## Blockchain integrations

### Supported networks

- **L1:** Mainnet (1), Sepolia (11155111), Hoodi (560048)
- **L2:** Optimism (10), Optimism Sepolia (11155420), Unichain (130), Unichain Sepolia (1301)

### L2 feature support

Only **Wrap/Unwrap** works on L2 (`<SupportL2Chains>` guard,
`useLidoSDKL2()`); the rest are L1-only — missing contracts:

| Feature     | L1  | L2  | Reason                                 |
| ----------- | --- | --- | -------------------------------------- |
| Wrap/Unwrap | ✅  | ✅  | `L2wstETH` contract available          |
| Stake       | ✅  | ❌  | No `stakingRouter` on L2               |
| Withdrawals | ✅  | ❌  | No `withdrawalQueue` on L2             |
| Earn        | ✅  | ❌  | No vault contracts (GGV/DVV/STG) on L2 |

### Key contracts

- **Lido (stETH)** — core staking contract
- **Lido Locator** — contract registry
- **Withdrawal Queue** — withdrawal request queue
- **wstETH / L2wstETH** — non-rebasing stETH wrapper
- **Earn Vaults** (mainnet only): GGV, DVV, STG
