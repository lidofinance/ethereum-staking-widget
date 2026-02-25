# Features & Pages

## Pages (routes)
| Route | File | Description |
|---|---|---|
| `/` | `pages/index.tsx` | Home page (staking or IPFS redirect) |
| `/earn` | `pages/earn/` | Yield vaults |
| `/withdrawals` | `pages/withdrawals/` | Request/claim ETH withdrawal |
| `/wrap` | `pages/wrap/` | Wrap/Unwrap stETH ↔ wstETH |
| `/rewards` | `pages/rewards.tsx` | Staking rewards history by address |
| `/referral` | `pages/referral.tsx` | Referral program |
| `/settings` | `pages/settings.tsx` | User settings |

## Features (features/)

### stake/
Core staking flow:
- Input ETH amount
- Display staking rewards APY
- Submit transaction to the Lido pool
- Receive stETH

### withdrawals/
- `request/` — create an ETH withdrawal request (queued)
- `claim/` — claim withdrawn funds after finalization
- Displays queue position and estimated wait time

### earn/
Yield vault strategies:
- GGV (Goldfinch Vault) — real-world assets
- DVV (Dual Voting Vault) — governance + yield
- STG (Strategy Vault) — multi-strategy
- Vault details: APY, TVL, deposit/withdraw

### wsteth/
- Wrap stETH → wstETH (prevents rebase exposure)
- Unwrap wstETH → stETH

### rewards/
- Staking rewards history by wallet address
- Real-time calculations
- Data export

### referral/
- Referral codes
- Referral statistics

### settings/
- Theme toggle (light/dark)
- Network settings
- User preferences

### ipfs/
- IPFS-specific components and overrides

## Shared
- `shared/components/` — reusable UI components (banners, buttons, etc.)
- `shared/hooks/` — common React hooks
- `shared/wallet/` — wallet connection UI
- `shared/transaction-modal/` — transaction status modal
- `shared/hook-form/` — form utilities
- `shared/formatters/` — data formatting utilities
