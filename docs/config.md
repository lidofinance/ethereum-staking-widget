# Configuration & Environment Variables

## Runtime env delivery ("one image, many envs")

The web image is built env-free; browsers receive runtime env as a
NON-EXECUTABLE JSON data element inside the HTML itself
(`<script type="application/json" id="window-env">`), parsed into
`window.__env__` by a fixed, CSP-hashed loader script. There is no
separately fetchable env URL, so env can never cache-skew against the
bundle — a cached HTML response is old-but-consistent.

**Single source of truth: `config/client-env-manifest.ts`.** Each entry
pairs an env var with the zod transform that produces its final typed
value; `ClientEnv = z.infer<…>` is the config type. Adding a frontend env
var = adding one entry there. Everything else derives:

- dev serve / IPFS builds: `scripts/vite/window-env-plugin.ts` fills the
  element in from process env (`.env.local` included);
- k8s web: the build ships an nginx SSI include instead; at container boot
  `infra/nginx/entrypoint.sh` runs the bundled `scripts/window-env-cli.ts`
  (esbuild output baked into the image; the runtime image carries `nodejs`
  for this one boot-time call) and nginx splices the JSON into every HTML
  response;
- no-window runtimes (vitest, the api bundle): `config/dynamics.ts` falls
  back to `buildClientEnv(process.env)`.

Because only post-transform values are serialized, presence-style flags
(`useValidationFile` etc.) ship as `true`/`false` while their source values
(file paths, internal hosts) never reach the browser — by construction.

### Deploy-visible behavior (for infra)

- **The web pod fails at boot** — instead of serving bad config — when:
  the env CLI fails or config invariants are violated (duplicate
  `SUPPORTED_CHAINS`, `DEFAULT_CHAIN` not first), or (enforcing CSP only)
  the build's `importmap-csp-hash.txt` is missing. A crash-looping pod
  after a deploy most likely means misconfigured env, not a broken image.
- **`IS_PROD=true` must be set on production** — it suppresses the test-env
  banner. (Previously this flag was never delivered to the SPA at all.)
- The `/runtime` emptyDir mount for `window-env.js` is obsolete — nothing
  writes there at boot anymore (`/var/cache/nginx` covers the env JSON).
- Env-only redeploys need no CDN purge: env travels inside the HTML
  response, never as a standalone cached asset.

Mechanism tests: `yarn test:unit` covers the manifest/serializer/loader
contract (`config/__tests__/client-env-manifest.test.ts`). The full stack —
real nginx SSI, CSP splicing, the api proxy — runs locally with
`docker compose up --build` (see README "Production build locally").

## Config system

- `config/get-config.ts` — main configuration object
- `config/get-secret-config.ts` — sensitive data (server-only, never sent to browser)
- `config/get-preconfig.ts` — pre-initialization config
- `config/provider.tsx` — ConfigProvider (React Context)
- `config/groups/` — config sections (web3, cache, ipfs, etc.)
- `config/feature-flags/` — feature flag definitions
- `config/networks/` — network/chain configuration
- `config/client-env-manifest.ts` — runtime env source of truth (see above)
- CSP is assembled at container boot by `infra/nginx/entrypoint.sh` (web)
  and at build time by `scripts/vite/ipfs-head-defaults-plugin.ts` (IPFS)

## Key env vars

### RPC

```
EL_RPC_URLS_1=...             # Mainnet RPC (comma-separated, first is primary)
EL_RPC_URLS_11155111=...      # Sepolia
EL_RPC_URLS_560048=...         # Hoodi
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
ENABLE_QA_HELPERS=true        # QA debug drawer + localStorage mocks (see testing.md)
QA_GEO_COUNTRY=DE             # Stand-in country for /api/geo without Cloudflare
IPFS_MODE=true                # IPFS distribution mode
COLLECT_METRICS=true          # Enable Prometheus metrics
RUN_STARTUP_CHECKS=true       # Health checks on startup
```

With `ENABLE_QA_HELPERS=true` the browser console also gets
`setMockGeoCountry('US')` — it pins the geo country per browser and outranks
both `QA_GEO_COUNTRY` and the real Cloudflare header. No argument clears it.

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
CONFIG_MANIFEST_PATH=...      # Path to a mounted config manifest file (e.g. k8s configmap);
                              # when set, it replaces the remote GitHub manifest for SSR and
                              # is served to the browser via /api/config-manifest.
                              # The file is public: never put deployment-private data in it.
```

## REMOTE_CONFIG_MANIFEST.json

Static config for IPFS deployment:

- Feature flags per chain
- Earn vault configuration
- API validation versions
- CID (Content Identifier) for IPFS

## networks/\*.json

Smart contract addresses per network:

- `networks/mainnet.json`
- `networks/sepolia.json`
- `networks/hoodi.json`
