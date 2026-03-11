# Configuration & Environment Variables

## Config system

- `config/get-config.ts` — main configuration object
- `config/get-secret-config.ts` — sensitive data (server-only, never sent to browser)
- `config/get-preconfig.ts` — pre-initialization config
- `config/provider.tsx` — ConfigProvider (React Context)
- `config/groups/` — config sections (web3, cache, ipfs, etc.)
- `config/feature-flags/` — feature flag definitions
- `config/networks/` — network/chain configuration
- `config/csp/` — Content Security Policy config

## Key env vars

### RPC

```
EL_RPC_URLS_1=...             # Mainnet RPC (comma-separated, first is primary)
EL_RPC_URLS_11155111=...      # Sepolia
EL_RPC_URLS_17000=...         # Holesky
PREFILL_UNSAFE_EL_RPC_URLS_*  # For IPFS mode (exposed to client)
```

### Networks

```
SUPPORTED_CHAINS=1,11155111   # Supported chain IDs
DEFAULT_CHAIN=1               # Default network
DEVNET_OVERRIDES=...          # Overrides for devnet
```

### External services

```
WALLETCONNECT_PROJECT_ID=...  # WalletConnect v2
REWARDS_BACKEND=...           # Rewards data API
MATOMO_URL=...                # Analytics
ETH_API_BASE_PATH=...         # Lido eth-api
WQ_API_BASE_PATH=...          # Withdrawals queue API
```

### Security

```
CSP_TRUSTED_HOSTS=...         # Content Security Policy trusted hosts
CSP_REPORT_ONLY=true/false    # CSP report-only mode
CSP_REPORT_URI=...            # CSP violation reporting endpoint
```

### Feature flags

```
ENABLE_QA_HELPERS=true        # Debug helpers in the browser console
IPFS_MODE=true                # IPFS distribution mode
COLLECT_METRICS=true          # Enable Prometheus metrics
RUN_STARTUP_CHECKS=true       # Health checks on startup
```

### Rate limiting

```
RATE_LIMIT=100                # Max requests per time frame
RATE_LIMIT_TIME_FRAME=60      # Time window in seconds
```

### Deployment

```
BASE_PATH=...                 # Next.js basePath
NODE_ENV=development|production
PORT=3000                     # Server port
```

## ipfs.json

Static config for IPFS deployment:

- Feature flags per chain
- Earn vault configuration
- API validation versions
- CID (Content Identifier) for IPFS

## networks/\*.json

Smart contract addresses per network:

- `networks/mainnet.json`
- `networks/sepolia.json`
- `networks/holesky.json`
