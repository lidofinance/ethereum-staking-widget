# Migration Research: Next.js 12 → ?

**Date:** 2026-02-24
**Project:** Lido Ethereum Staking Widget
**Status:** Research / Draft

---

## 1. Context and Problem Statement

### Current Situation

The project runs on **Next.js 12.3.4** — a version released in 2022 and officially unsupported since 2023. On this version we managed to:
- Patch all known vulnerabilities
- Understand and lock down the behavior of all used mechanisms
- Establish a stable deployment pipeline (web + IPFS)

### Problems with the Current Approach

1. **Outdated tooling.** Webpack 5 without SWC by default; slow development iteration. Many modern packages require Next.js 13+.
2. **Ecosystem drift.** Dependencies we want to upgrade (wagmi, viem, reef-knot, lido-ui) are drifting out of compatibility with Next.js 12.
3. **Workarounds.** Conditional compilation via `webpack-preprocessor-loader` for IPFS mode, `string-replace-loader` to work around `@base-org/account` issues — these are artifacts of the old stack's limitations.
4. **No Vercel support.** Security patches for Next.js 12 are no longer released.

### Key Requirements for a Solution

| Priority | Requirement |
|---|---|
| 🔴 Critical | **Security**: minimal attack surface, predictable behavior |
| 🔴 Critical | **Ease of future updates**: stable API, no aggressive breaking changes |
| 🟡 Important | **Migration complexity**: realistic scope of work |
| 🟡 Important | **IPFS compatibility**: deploy as a static site without SSR |
| 🟢 Nice-to-have | **DX**: build speed, HMR, TypeScript |

---

## 2. Audit of Current Next.js Usage

Before evaluating options, it is important to understand exactly what Next.js features are in use and how deep the dependency goes.

### 2.1 Next.js Features in Use

| Feature | Used? | Details |
|---|---|---|
| `getStaticProps` + ISR | ✅ Yes | All pages, via `getDefaultStaticProps()` |
| `getStaticPaths` | ✅ Yes | `/wrap/[[...mode]]`, `/earn/[vault]/[action]` |
| `getServerSideProps` | ❌ No | |
| `getInitialProps` | ✅ Partially | Only in `_document.tsx` (styled-components SSR) |
| API Routes (`pages/api/`) | ✅ Yes | 8 routes (see below) |
| Edge Middleware | ❌ No | No `middleware.ts` file |
| App Router / RSC | ❌ No | Pages Router only |
| Server Actions | ❌ No | |
| `next/image` | ❌ No | Not used |
| `next/link` | ✅ Yes | Via custom wrapper `LocalLink` |
| `next/router` | ✅ Yes | `useRouter`, `router.query`, `router.replace` |
| `next/head` | ✅ Yes | Meta tags on pages |
| `publicRuntimeConfig` | ✅ Yes | basePath, developmentMode, collectMetrics |
| `serverRuntimeConfig` | ✅ Yes | RPC URLs, secrets, API endpoints |
| Custom webpack | ✅ Yes | SVG, MD loaders, IPFS conditional compilation |
| `styled-components` SSR | ✅ Yes | `ServerStyleSheet` in `_document.tsx` |
| IPFS mode | ✅ Yes | `exportPathMap`, `trailingSlash`, `assetPrefix`, conditional compilation |

### 2.2 API Routes — The Critical Part

This is the entirety of the server-side logic:

| Route | Purpose | Notes |
|---|---|---|
| `/api/health` | Health check | Simple |
| `/api/csp-report` | CSP violation reporting | Logging |
| `/api/metrics` | Prometheus metrics | Rate limited |
| `/api/rewards` | Proxy to rewards backend | Caching (1s TTL), CORS |
| `/api/validation` | ETH address validation | SSRF protection, caching |
| `/api/rpc` | JSON-RPC proxy | Core: method/address allowlist, rate limiting, multi-chain, metrics |
| `/api/earn/vaults-apr` | APR for earn vaults | In-memory cache, on-chain calls |
| `/api/earn/vaults-tvl` | TVL for earn vaults | In-memory cache, on-chain calls |

**Takeaway:** The server-side surface is small but critically important — especially `/api/rpc`, which hides RPC credentials from the client and filters allowed calls.

### 2.3 How "Server-Side" Is the App Really?

Key observation: **virtually all business logic is client-side:**

- Wallet connection, transaction signing — wagmi/viem in the browser
- Blockchain data — react-query + wagmi hooks
- Application state — React Context, react-query
- Pages use `getStaticProps` only to fetch the manifest at build time

**What actually runs on the server:**
- RPC proxy (credential hiding)
- Metrics endpoint
- Proxying to external APIs (rewards, validation)
- Setting security headers

This is a critical insight for evaluating alternatives.

### 2.4 High-Complexity Migration Points

| Issue | Complexity |
|---|---|
| Conditional compilation (`webpack-preprocessor-loader`) for IPFS | 🔴 High |
| `serverRuntimeConfig` — non-standard secret injection mechanism | 🟡 Medium |
| `styled-components` SSR via `ServerStyleSheet` in `_document` | 🟡 Medium |
| `exportPathMap` for IPFS builds | 🟡 Medium |
| SVG/MD webpack loaders | 🟢 Low |
| `next/router` usage (20+ files) | 🟢 Low (stable API) |

---

## 3. Next.js: Security Vulnerability History

One of the core reasons to consider alternatives is the pattern of security issues introduced with each major Next.js feature.

### 3.1 Key CVEs

| CVE | Date | CVSS | Description | Attack Vector |
|---|---|---|---|---|
| **CVE-2025-29927** | March 2025 | 9.1 (Critical) | Middleware auth bypass via `x-middleware-subrequest` header — allows skipping any auth logic in middleware | Middleware |
| **CVE-2024-56332** | December 2024 | High | DoS via infinite loop in the dev server | Dev server |
| **CVE-2024-46982** | September 2024 | 7.5 (High) | Cache poisoning via crafted response headers with ISR/CDN | ISR cache |
| **CVE-2024-34351** | May 2024 | 7.5 (High) | SSRF in Server Actions via `host` header manipulation | Server Actions |
| **CVE-2024-34350** | May 2024 | High | HTTP request smuggling — inconsistent request interpretation | HTTP parsing |
| **CVE-2023-46298** | November 2023 | 7.5 (High) | DoS via memory exhaustion on crafted requests | HTTP server |
| **CVE-2022-21721** | January 2022 | Medium | Open redirect via malformed URL | Routing |
| **CVE-2022-21720** | January 2022 | Medium | Path traversal | File serving |

### 3.2 Vulnerability Pattern

A clear pattern emerges: **every major new Next.js feature has introduced serious vulnerabilities:**

- Middleware → CVE-2025-29927 (Critical auth bypass)
- Server Actions → CVE-2024-34351 (SSRF)
- ISR/Caching layer → CVE-2024-46982 (cache poisoning)
- Core HTTP layer → CVE-2024-34350 (request smuggling), CVE-2023-46298 (DoS)

### 3.3 Relevance to This Project

The most critical CVE-2025-29927 (middleware bypass) **does not affect this project** — there is no `middleware.ts`. CVE-2024-34351 (Server Actions SSRF) is also not applicable — Server Actions are not used.

**However, this does not mean the project is risk-free:** HTTP-layer vulnerabilities (request smuggling, DoS, cache poisoning) apply regardless of which features are enabled.

### 3.4 Conclusion on Next.js Security

Vercel did not build Next.js as a security-focused framework. Its goal is developer productivity and ecosystem growth. When working with user funds, the priorities must be the opposite.

---

## 4. Migration Options

Four realistic options are considered.

---

### Option A: Upgrade to Next.js 14/15 (Pages Router)

**Summary:** Update Next.js while staying on the Pages Router. Do not migrate to App Router or RSC — they add complexity and new attack vectors.

#### Technical Changes Required:
- `webpack-preprocessor-loader` → replace with environment-based exports or separate build configs
- `serverRuntimeConfig`/`publicRuntimeConfig` → deprecated, migrate to env vars
- `_document.tsx` + `ServerStyleSheet` → needs adaptation (Next.js 13+ handles styled-components SSR differently)
- `exportPathMap` for IPFS → behavior changed in Next.js 14+ (requires investigation)
- SVG/MD loaders → may need updates for new webpack version

#### Pros:
- Minimal changes to the codebase
- Familiar patterns
- Pages Router is fully supported in Next.js 14/15 without API changes
- No risk of regressions in business logic

#### Cons:
- **Retains the entire Next.js runtime attack surface** — complex Vercel HTTP server with lots of undocumented behavior
- **Pages Router pressure** — each release focuses more on App Router; security fixes may arrive later for Pages Router
- **Vercel dependency** — architectural decisions are made by the company, not the community
- IPFS conditional compilation must be rewritten regardless
- The same problem will recur with Next.js 16

#### Migration Complexity:
- Estimated **7–14 days** of development
- Risk: ISR and staticProps behavior may change in subtle ways

---

### Option B: Vite + React SPA + Fastify

**Summary:** Explicitly separate the frontend and backend. Frontend — a pure React SPA built with Vite. Backend — Fastify serving the API routes.

#### Architecture:
```
/
├── app/          # React SPA (Vite)
│   ├── src/
│   │   ├── pages/    # routes (React Router 7 or TanStack Router)
│   │   ├── features/
│   │   └── ...
│   └── vite.config.ts
└── server/       # Fastify API server
    ├── routes/
    │   ├── health.ts
    │   ├── rpc.ts
    │   ├── metrics.ts
    │   ├── rewards.ts
    │   └── earn/
    └── server.ts
```

#### Key Technologies:
- **Vite 6** — build tooling, HMR (significantly faster than webpack)
- **React 18/19** — unchanged
- **TanStack Router** or **React Router 7** — type-safe routing
- **Fastify 5** — minimal, security-focused HTTP server with a rich plugin ecosystem

#### IPFS Mode:
Natively supported — a SPA is by nature a static deployment. IPFS build: `vite build` → static files. No conditional compilation needed — simply `import.meta.env.VITE_IPFS_MODE`.

#### Pros:
- **Minimal attack surface**: Fastify is a compact server that does exactly what is written — no "magic"
- **Fastify security track record** is significantly better than Next.js
- **Easy future updates**: Vite/Fastify have stable APIs without aggressive breaking changes
- **Native IPFS**: SPA = static files, no hacks needed
- **Faster development**: Vite HMR is substantially faster than webpack-based Next.js
- **Explicit frontend/backend boundary** — clear understanding of what runs where
- **Independent scaling** and deployment of each part

#### Cons:
- **Largest migration effort** — essentially a rewrite
- **Loss of ISR** — no server-side rendering when deployed as SPA (but in this project ISR is only used to load the manifest — solvable differently)
- **SEO**: No SSR, but DApps are not meaningfully indexed by search engines
- Routing must be built from scratch
- All API middleware (rate limiting, CORS, metrics) must be ported to Fastify plugins

#### Migration Complexity:
- Estimated **3–5 weeks**
- This is effectively a new project with business logic ported over
- High risk: all security details must be carried over correctly (RPC allowlist, SSRF protection in validation route)

---

### Option C: Remix 2

**Summary:** A modern full-stack React framework built on web standards.

#### Pros:
- Web standards first (fetch API, Response, Request) — predictable behavior
- Good security model (no "magic" in routing, no middleware layer)
- Actively developed
- Good form and data loading primitives

#### Cons:
- **Overkill for a DApp**: SSR in Remix makes sense when data comes from the server. Blockchain data is always client-side
- **No native IPFS support** — SSR requires a server; IPFS deployment becomes more complex
- Relatively young; patterns are not yet settled
- Greater migration complexity than Option A without clear advantages

**Verdict: Not recommended** for this project.

---

### Option D: TanStack Start

**Summary:** A new full-stack framework built on TanStack Router + Vite.

#### Pros:
- Fully type-safe routing
- Vite under the hood (fast builds)
- Tight integration with TanStack Query (already used in the project)

#### Cons:
- **RC/Beta at the time of this research** — too risky for production handling real user funds
- Unstable API; significant changes expected
- Small community, few production case studies

**Verdict: Not recommended** now. Worth re-evaluating in 12–18 months.

---

## 5. Comparative Analysis

### 5.1 By Key Criteria

| Criterion | Next.js 14/15 | Vite + Fastify | Remix 2 | TanStack Start |
|---|---|---|---|---|
| **Security** | 🟡 Medium | 🟢 High | 🟢 High | 🔴 Low (immature) |
| **Ease of updates** | 🟡 Medium | 🟢 High | 🟡 Medium | 🔴 Low (unstable) |
| **Migration effort** | 🟢 Low (7–14d) | 🔴 High (3–5w) | 🔴 High (4–6w) | 🟡 Medium |
| **IPFS support** | 🟡 Requires hacks | 🟢 Native | 🔴 Difficult | 🟡 Unclear |
| **DX / build speed** | 🟡 Medium | 🟢 High (Vite) | 🟢 High | 🟢 High (Vite) |
| **Ecosystem maturity** | 🟢 High | 🟢 High | 🟡 Medium | 🔴 Low |
| **Performance** | 🟡 Medium | 🟢 High | 🟢 High | 🟢 High |
| **DApp readiness** | 🟢 Proven | 🟢 Naturally suited | 🟡 Atypical | 🔴 Unproven |

### 5.2 Security Deep Dive

#### Next.js 14/15
- Complex HTTP runtime with many internal mechanisms
- Historical rate: ~1 Critical/High CVE every 3–6 months over the past 2 years
- Every new feature = new attack vector (RSC, Server Actions, middleware)
- **Positive**: Not using middleware and Server Actions means most CVEs are not directly applicable
- **Negative**: No guarantee that HTTP-layer vulnerabilities won't appear in core

#### Vite + Fastify
- Fastify: minimal, security-conscious, well-auditable codebase
- Vite: build tool only — no Vite server runs in production
- Significantly less undocumented behavior
- Any security issue is easy to spot — all server code is explicit
- **Positive**: Almost no "magic"; everything the server does is written by the team
- **Positive for DApp**: In production the server only does RPC proxy + a handful of endpoints

### 5.3 Migration Risks

#### Upgrading to Next.js 14/15:
- ⚠️ ISR behavior changes (caching, revalidation semantics) — requires thorough testing
- ⚠️ `serverRuntimeConfig` deprecated — must be migrated to avoid future issues
- ⚠️ styled-components SSR may behave differently (hydration mismatches)
- ⚠️ `exportPathMap` behavior changed in Next.js 14+ — requires investigation

#### Moving to Vite + Fastify:
- 🔴 Risk of losing security logic when porting `/api/rpc` — this is the highest risk item
- 🔴 RPC allowlist filtering — must be ported without errors
- 🔴 Rate limiting — must be reproduced exactly
- ⚠️ No SSR requires an alternative solution for manifest loading (currently via getStaticProps)
- ⚠️ Routing must be built from scratch

---

## 6. Recommendations

### 6.1 Strategic View

Key insight: **this project is de facto a SPA with a thin API layer.**

All blockchain data is client-side (wagmi hooks). Server-side rendering (`getStaticProps`) is used only to fetch the manifest at build time — this is not true SSR, it is build-time data fetching. In IPFS mode the project already runs as pure static files.

This means **Next.js as a full-stack SSR framework is overkill** for what this project actually needs. We are paying in complexity and vulnerability exposure for features we do not use.

### 6.2 Recommended Option: Vite + React SPA + Fastify

Given sufficient resource (3–5 weeks) — **the optimal long-term solution**.

**Why:**

1. **Security**: Fastify is easily auditable. No HTTP "magic". Everything the server does is written explicitly. When the next Next.js CVE drops, this project will be outside the blast radius.

2. **Updateability**: Vite and Fastify have stable APIs without the aggressive breaking changes of Next.js. The Vite ecosystem is growing rapidly and is very active.

3. **IPFS**: Native support — a SPA is inherently a static site. No conditional compilation, no webpack hacks.

4. **Fits the project's nature**: DApp = browser application + thin proxy. That is exactly Vite SPA + Fastify.

5. **DX**: Vite HMR is dramatically faster than webpack-based Next.js. First-class TypeScript support.

### 6.3 Alternative Option: Next.js 14/15 (fast path)

If there is no resource for a full migration — **a reasonable interim step**.

**How to do it correctly:**
- Stay on **Pages Router** (do not move to App Router)
- **Do not use**: middleware, Server Actions, RSC — these are all attack vectors
- Migrate `serverRuntimeConfig` → env vars
- Rewrite IPFS conditional compilation to environment-based exports
- Establish a policy: **never enable new Next.js features without a security review**

**The problem:** This is again a temporary solution. The same situation will repeat with Next.js 16.

### 6.4 Decision Matrix

```
Priority: SECURITY and LONG-TERM STABILITY  → Vite + Fastify
Priority: SPEED OF DELIVERY                 → Next.js 14/15 (Pages Router)
```

---

## 7. Proposed Implementation Plan

### Phase 0: Immediate (1–2 days)
- Update Next.js 12 to the latest 12.3.x patch version (security fixes)
- Audit all dependencies for known CVEs (`yarn audit`)
- Establish a baseline with E2E tests

### Phase 1 (if choosing Next.js 14/15): ~2 weeks
1. Upgrade Next.js to 14.x (Pages Router, no App Router)
2. Migrate `serverRuntimeConfig` → env vars with Zod validation (`z.env`)
3. Rewrite IPFS conditional compilation (`import.meta.env` or separate entry points)
4. Update styled-components to an RSC-compatible version (or migrate to emotion/tailwind)
5. Update all ecosystem dependencies (wagmi v2, viem v2, reef-knot latest)
6. E2E tests across all flows

### Phase 1 (if choosing Vite + Fastify): ~4–5 weeks
1. **Week 1**: Vite + React SPA + TanStack Router setup, base routing, provider composition
2. **Week 2**: Fastify server — port all `/api/*` routes with full security logic intact
3. **Week 3**: Port features (stake, withdrawals, earn, wsteth, wrap, rewards)
4. **Week 4**: IPFS build, security headers, environment variables, production build
5. **Week 5**: E2E tests, security review, performance testing, staging deploy

---

## 8. Open Questions

1. **Is there a zero-downtime SLA for the migration?** — Affects the deployment plan for the Vite+Fastify option
2. **Are there SSR requirements for SEO?** — If not (DApps are not meaningfully indexed), SPA is ideal
3. **What is the actual traffic and load on the API routes?** — Affects Fastify configuration choices
4. **Is `/api/validation` using `validationFilePath` (local file)?** — Filesystem access must be preserved in Vite+Fastify
5. **Are more Earn vaults planned?** — Relevant to understanding the long-term server-side scope

---

## 9. Conclusion

| | Next.js 14/15 | Vite + Fastify |
|---|---|---|
| Time to deliver | 2 weeks | 4–5 weeks |
| Security | Improves | Significantly improves |
| Long-term viability | Moderate | High |
| Migration risk | Low | Medium |
| IPFS | Requires hacks | Native |
| Updateability | Moderate | High |

**Recommendation:** Given 4–5 weeks of resource — **Vite + React SPA + Fastify**. This is the only option that solves the problem structurally rather than deferring it.

Without that resource — **Next.js 14/15 with Pages Router**, a strict ban on App Router/middleware/Server Actions, and the explicit understanding that this is a temporary solution for 1–2 years.

---

*This document was prepared based on: a codebase audit of the project + public CVE databases + architectural analysis.*
