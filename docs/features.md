# Features & Pages

## Routes

Defined in `app/router` (React Router 7, lazy chunks); components are
`app/routes/*`.

| Route                  | File                | Description                |
| ---------------------- | ------------------- | -------------------------- |
| `/`                    | `home`              | Staking / IPFS redirect    |
| `/wrap(/:mode)`        | `wrap`              | Wrap/Unwrap stETH ↔ wstETH |
| `/withdrawals(/:mode)` | `withdrawals`       | Request/claim withdrawal   |
| `/rewards`             | `rewards`           | Rewards history by address |
| `/earn`                | `earn`              | Vaults list                |
| `/earn/:vault/:action` | `earn-vault-action` | Vault deposit/withdraw     |
| `/settings`            | `settings`          | User settings              |
| `*`                    | `not-found`         | 404                        |

## Features

- **stake/** — input ETH, show APR, submit to Lido, receive stETH
- **withdrawals/** — `request/` (queued) + `claim/` (after finalization)
- **dex-withdrawals/** — instant exit via DEX (CowSwap)
- **earn/** — vaults (GGV, DVV, STG): APY, TVL, deposit/withdraw
- **wsteth/** — wrap/unwrap stETH ↔ wstETH
- **rewards/** — rewards history by address, export
- **referral/** — referral banners/links
- **settings/** — RPC/network settings, preferences
- **ipfs/** — IPFS-specific UI (banners, RPC checks, CSP box)
- **qa-debug/** — QA drawer (see [testing.md](./testing.md))

## Shared

- `shared/components/`, `shared/hooks/` — reusable UI and hooks
- `shared/wallet/` — wallet connection UI
- `shared/transaction-modal/` — tx status modal
- `shared/hook-form/`, `shared/formatters/` — form/formatting utils
- `shared/seo.ts` — route meta for the head prerender
