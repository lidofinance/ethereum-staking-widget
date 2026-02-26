# Architecture & Patterns

## Stack

> Versions below are major versions only. Check `package.json` for exact versions.

- **Next.js 12** (React 18, SSR/SSG)
- **TypeScript 5**
- **wagmi 3** + **viem 2** — Ethereum interaction
- **Reef Knot 8** — wallet connection abstraction
- **@lidofinance/lido-ethereum-sdk 4** — Lido SDK
- **@tanstack/react-query 5** — server state management and caching
- **React Hook Form 7** + **Zod** — forms and validation
- **styled-components 5** — CSS-in-JS
- **@lidofinance/lido-ui** — Lido design system

## Provider composition (app entry)
```
ConfigProvider
  → Web3Provider (wagmi + reef-knot)
    → QueryClientProvider (react-query)
      → ModalProvider
        → AppFlagProvider
          → (feature providers)
```
Entry point: `pages/_app.tsx`, providers: `providers/index.tsx`

## Architectural patterns

### Feature modules (features/)
Vertical slices: each folder contains everything for its feature —
components, hooks, utilities, types. Imported via barrel index files.

### Custom hooks
- Data: `useQuery` / `useMutation` from react-query
- Web3: `useBalance`, `useAllowance`, `useContractAddress` (from `modules/web3/hooks/`)
- Forms: `useFormContext`, `useWatch` (React Hook Form)
- Transactions: `useTxFlow`, modal-based multi-step flow

### Transaction flow
1. Form → validation (zod)
2. Transaction modal opens (`shared/transaction-modal/`)
3. Approval step (if allowance is required)
4. Transaction submission
5. Waiting for confirmation

Account Abstraction (safe-global, ERC-4337) supported via reef-knot.

### Multi-network support
- Chain configuration: `config/networks/`
- Contract addresses per network: `networks/mainnet.json`, `networks/sepolia.json`, etc.
- RPC per chain via env vars: `EL_RPC_URLS_{CHAIN_ID}`

### Feature flags
- `config/feature-flags/` — flag definitions
- External config loaded from IPFS/CDN at runtime
- `ipfs.json` — static per-chain overrides
- Flags can disable entire pages

### IPFS mode
- Build: `yarn build:ipfs` (sets `IPFS_MODE=true`)
- Webpack conditional compilation via `webpack-preprocessor-loader`
- Separate code paths for IPFS vs. standard deployment
- Trailing slashes, asset prefix configured for IPFS

### API routes (pages/api/)
- Health check
- Prometheus metrics (`/api/metrics`)
- RPC proxy (hides RPC credentials, method allowlisting)
- External config proxy
- Rate limiting via middleware

### Data fetching
- React Query — caching, revalidation
- Strategies defined in `consts/react-query-strategies.ts`
- In-memory cache for vault APR/TVL data
- `utilsApi/` — server-side utilities for API routes

## Blockchain integrations

### Supported networks
- **L1:** Mainnet (1), Sepolia (11155111), Holesky (17000)
- **L2:** Optimism (10), Optimism Sepolia (11155420), Soneium (1868), Soneium Minato (1946), Unichain (130), Unichain Sepolia (1301)

### L2 feature support
Only **Wrap/Unwrap** is available on L2. The page uses `<SupportL2Chains>` guard and `useLidoSDKL2()` for L2-specific logic.

All other features are L1-only due to missing contracts on L2:

| Feature | L1 | L2 | Reason |
|---|---|---|---|
| Wrap/Unwrap | ✅ | ✅ | `L2wstETH` contract available |
| Stake | ✅ | ❌ | No `stakingRouter` on L2 |
| Withdrawals | ✅ | ❌ | No `withdrawalQueue` on L2 |
| Earn | ✅ | ❌ | No vault contracts (GGV/DVV/STG) on L2 |

### Key contracts
- **Lido (stETH)** — core staking contract
- **Lido Locator** — registry of Lido contracts
- **Withdrawal Queue** — ETH withdrawal request queue
- **wstETH / L2wstETH** — non-rebasing wrapper for stETH
- **Earn Vaults** (mainnet only):
  - GGV: `0xef417FCE1883c6653E7dC6AF7c6F85CCDE84Aa09`
  - DVV: `0x5E362eb2c0706Bd1d134689eC75176018385430B`
  - STG: `0x277C6A642564A91ff78b008022D65683cEE5CCC5`
