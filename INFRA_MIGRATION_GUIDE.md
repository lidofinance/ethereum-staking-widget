# Infrastructure Migration Guide (Generic)

This document describes how to migrate a Next.js-based project from a monolithic
runtime (Next server + pages/api) to a split architecture with:

- Scheduler build service (static export + rotation)
- Fastify API service (replacing pages/api)
- Nginx static server (serves build artifacts + proxies API)
- Docker Compose orchestration

It is designed to be reusable across repositories with similar starting
architecture. Adjust paths, ports, and Node versions to match the target repo.

---

## 0) Preconditions

- The app can be statically exported (`next export`) or has a static build output.
- You can run Node in Docker (version may differ; align to your repo).
- You can run the API separately from the Next runtime.

If the app is not fully static, identify dynamic routes and plan for SSR or API
fallbacks before proceeding.

---

## 1) Create the Scheduler Service

Purpose: periodically build the static site, rotate output, expose health and
metrics.

### Files to add

- `infra/scheduler/index.ts`
- `infra/scheduler/entrypoint.sh`
- `infra/scheduler/esbuild.mjs`

### Responsibilities

- Runs `yarn build:static` on an interval (e.g., every 10 minutes).
- Copies build output (usually `/app/out`) into `/app/dist/<timestamp>`.
- Updates symlink `/app/dist/current` to point at the latest build.
- Keeps last N builds (e.g., 12).
- Exposes:
  - `GET /health`
  - `GET /metrics`

### Env vars (suggested)

- `SCHEDULER_PORT` (default 3000)
- `SCHEDULER_INTERVAL_SECONDS` (default 600)
- `MAX_BUILDS` (default 12)
- `SCHEDULER_DIST_ROOT` (default `/app/dist`)
- `SCHEDULER_BUILD_OUTPUT` (default `/app/out`)

### Notes

- If your build output path differs (`out/` vs `build/`), update the scheduler.
- Ensure build logs stream to stdout/stderr (use `spawn` + pipes).
- Bundle the scheduler with `esbuild` into `infra/scheduler/dist/index.cjs` and
  run it from `infra/scheduler/entrypoint.sh`.

---

## 2) Create the Fastify API Service

Purpose: replace `pages/api/*` with a standalone HTTP service.

### Files to add (example)

- `infra/api/server.ts`
- `infra/api/metrics.ts`
- `infra/api/*.ts` (handlers)
- `infra/api/entrypoint.sh`
- `infra/api/esbuild.mjs`
- `infra/api/tsconfig.json`
  - Example `infra/api/tsconfig.json`:

```
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "../../",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2020",
    "noEmit": false,
    "types": ["node"]
  },
  "include": ["./**/*.ts"],
  "exclude": ["./dist", "./**/*.test.ts"]
}
```

### Responsibilities

- Serve endpoints previously located in `pages/api/*`.
- Provide:
  - `/health`
  - `/api/metrics` (Prometheus)
- Optional:
  - Rate limiting
  - Pushgateway on shutdown

### Script

Add a script in `package.json`:

```
dev:api: tsx infra/api/server.ts
dev:scheduler: tsx infra/scheduler/index.ts
build:static: next build && next export
build:api: node infra/api/esbuild.mjs
build:scheduler: node infra/scheduler/esbuild.mjs
```

### Notes

- Match existing response schemas for backward compatibility.
- To run API and scheduler in Docker, use one Docker image with different CMD.
  Build both apps during the image build and run the compiled `.cjs` entrypoints.
- Use fastify-native request handling (e.g., `app.route`) over adapter wrappers.
- For RPC endpoints that expect `fetch`-style response helpers, provide a small
  `res.status(...)`/`res.json(...)` shim before invoking the handler.
- Build API/Scheduler entrypoints with `esbuild` into a single `.cjs` bundle to
  avoid ESM resolution issues at runtime.
- For maintainability, split the API into route modules (e.g., `infra/api/routes/*.ts`) and register them from a small `server.ts` entrypoint.
- After generating entrypoints, make them executable: `chmod +x ./infra/api/entrypoint.sh ./infra/scheduler/entrypoint.sh`.

### Rate limiting (optional, in-server)

Instead of per-route wrappers, you can add Fastify hooks:

- `onRequest` to count requests by `ip + route` (in memory).
- `onResponse` to emit timing metrics.

Suggested env vars:

- `RATE_LIMIT` (default 100 requests)
- `RATE_LIMIT_TIME_FRAME` (default 60 seconds)

If you want a maintained limiter, use `@fastify/rate-limit`:

```
import rateLimit from '@fastify/rate-limit';

await app.register(rateLimit, {
  max: RATE_LIMIT,
  timeWindow: RATE_LIMIT_TIME_FRAME * 1000,
  keyGenerator: (request) => `${request.ip}:${request.routerPath ?? request.raw.url}`,
  allowList: (request) => !request.raw.url?.startsWith('/api/') || request.raw.url?.startsWith('/api/health'),
});
```

---

## 3) Replace pages/api with Fastify Routes

Purpose: remove Next.js API routes to avoid runtime server dependency.

### Steps

- Move logic from `pages/api/*` to `infra/api/*`.
- Update client code to call `/api/...` (same paths).
- Remove `pages/api/*` files after migration.

### Notes

- Keep the same HTTP methods and JSON structure unless you can version APIs.
- For RPC endpoints, explicitly allow `POST` and `OPTIONS` to cover wallet
  preflight behavior.
- reply methods are should be called in an async way

---

## 4) Add the Nginx Static Server

Purpose: serve built assets and proxy API.

### Files to add

- `infra/server/default.conf.template`

### Responsibilities

- Serve `/app/dist/current` as document root.
- Proxy `/api/*` to the API container.
- Add security/caching headers directly in Nginx (since `output: 'export'` disallows `headers()` in Next).
- Proxy `/scheduler/metrics` with a todo comment that is it for debugging purposes
- Next.js redirects configuration (`next.config.*`) that must be migrated to Nginx/gateway

### Example proxy

```
location /api/ {
  proxy_pass ${API_URL};
}

location /scheduler/metrics {
  proxy_pass $SCHEDULER_URL/metrics;
}

```

### Notes

- If you already have a reverse proxy, integrate there instead.
- Prefer the Nginx `templates/` pattern so env vars are substituted at startup.
  Define `API_URL`, `SCHEDULER_URL`  and the `HEADER_*` values in Compose.
- Add explicit routes for `manifest.json`, runtime-injected JS, and any static
  cache-control overrides that used to live in Next headers.
- For a simple compose setup, you can hardcode `listen 80` and proxy to
  `http://api:4000` to avoid extra env templating.
- Do not use `envsubst`

---

## 5) Add Docker Compose Topology

Purpose: orchestrate scheduler, API, server, and optional metrics.

### Services

- `scheduler`: builds static assets on a loop
- `api`: Fastify server
- `server`: Nginx serving `/app/dist/current`
- `pushgateway`: Prometheus Pushgateway (`prom/pushgateway:v1.8.0`)

### Shared volume

- A named volume (e.g., `widget-dist`) mounted to `/app/dist`
  - Scheduler writes to it
  - Nginx serves from it

### Notes

- Publish only the ports you need externally.
- Keep scheduler and API internal if not required to be public.
- If you rely on `.env` files, prefer `env_file` in Compose and standardize on
  `.env.local` to avoid leaking secrets into `.env` defaults.
  - Mark it as required if the stack must not boot without it.
- Pass API_URL and SCHEDULER_URL through env
- Update all env variables used in Docker compose in `.env.example` file
- If you serve the static site via Nginx, map the container to a host port
  (e.g., `3005:80`) and keep API/scheduler ports internal.
- In the Dockerfile, create writable runtime dirs and ensure entrypoints are
  executable before running the services.

---

## 6) Update Build Script

Purpose: ensure build produces static export.

### Example

```
build: next build
build:static: next build && next export
build:api: node infra/api/esbuild.mjs
build:scheduler: node infra/scheduler/esbuild.mjs
```

### Notes

- `next export` is deprecated since Next.js v13.3.0; use `output: 'export'` in `next.config` instead.
- Move any custom next `headers()` rules to the Nginx config.
- If your Next version or configuration differs, update accordingly.
- Some apps require `trailingSlash` or `assetPrefix` for IPFS or CDN.
- If there is any script in postinstall, make sure to copy files it requires in Dockerfile before running npm install
- Add target build folder to `.gitignore`
- In Docker, pre-create and permission any writable runtime paths (e.g., static output, runtime-injected env files, build caches) and ensure entrypoint scripts are executable. Avoid recursive chown on large trees; prefer targeting only required paths.
  - Example paths: `/app/dist`, `/app/public/runtime`, `/app/.next/cache`.
- If you run SSR alongside static output, make sure the Docker image runs
  `yarn build` during image build so `yarn start` has a compiled `.next`.

---

## 7) Update Runtime Configuration

Purpose: rework config injection for a static build + external API.

### Steps

- Split config into client vs server buckets.
- Expose client config via `publicRuntimeConfig` or `next.config` env.
- Move server-only values to API service env.

### Notes

- If you rely on runtime-injected env values (via `public/runtime`), decide
  whether to keep or replace that mechanism.

---

## 8) Update Observability

### Scheduler

- `/metrics` from `prom-client`.

### API

- `/api/metrics` from `prom-client`.
- Push metrics to Pushgateway on shutdown (or at intervals) if you need a pull-less model.

### Notes

- Align labels/prefixes with your metrics conventions.
- Document the pushgateway URL and job name in `.env.example`, and wire the container in `docker-compose.yml` (see the `pushgateway` service).

---

## 9) Clean Up Legacy Runtime

### Remove or deprecate

- Rename old Dockerfile to `Dockerfile.deprecated`
- Remove `pages/api/*` routes and wrappers.
- Remove Old API wrappers that are only used by Next server.

---

## 10) Compatibility Checklist (Adjust Per Repo)

- Node version in Dockerfiles (for the version on `.nvmrc`, current `package.json` or if none is specified, use node v20)
- Ensure TypeScript is updated to at least `^5.2.2`.
- Next.js version and static export support
- Build output path (`out/`, `build/`, custom)
- Port mapping (API, scheduler, nginx)
- Environment variable names and defaults
- Rate limiting and CORS behavior
- Any custom reverse proxy or ingress config

---

## 11) Validation Steps

1. `yarn build` succeeds and produces static output.
2. Scheduler builds and rotates `dist/<timestamp>` + `dist/current`.
3. Nginx serves `dist/current` and responds to `/`.
4. API responds to `/health` and `/api/*` endpoints.
5. `/metrics` endpoints return Prometheus output.

---

## 12) Common Pitfalls

- API routes removed before client code is updated.
- Static export not enabled, leading to missing `out/`.
- Nginx root path not matching build output.
- API service not on the same Docker network as Nginx.
- Environment variables only defined in Next.js but not in API container.
- Don’t remove Next.js helper dependencies (e.g., `@lidofinance/next-api-wrapper`, `@lidofinance/next-ip-rate-limit`) unless the migration explicitly replaces their usage everywhere.

---

## 13) Suggested File/Folder Layout

```
infra/
  api/
    server.ts
    entrypoint.sh
    esbuild.mjs
    tsconfig.json
    ...
  scheduler/
    index.ts
    entrypoint.sh
    esbuild.mjs
    tsconfig.json
  server/
    default.conf.template
Dockerfile
Dockerfile.deprecated
docker-compose.yml
```

---

## 14) When to Deviate

---

If you want a repo-specific migration plan, provide:

- `git diff` vs its baseline
- Its current Docker/compose files
- Any required ports or security constraints
