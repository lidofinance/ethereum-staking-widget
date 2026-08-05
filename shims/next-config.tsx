/**
 * Compatibility shim for `next/config`'s `getConfig()` default export.
 * Resolved via Vite alias.
 *
 * Returns the same `{ serverRuntimeConfig, publicRuntimeConfig }` shape
 * `next.config.mjs` used to provide:
 *
 * - `publicRuntimeConfig` carried exactly three keys (`basePath`,
 *   `developmentMode`, `collectMetrics`) — everything else always flowed
 *   through `window.__env__` / `env-dynamics.mjs` (see `config/dynamics.ts`),
 *   which is unchanged by the migration.
 * - `serverRuntimeConfig` is deliberately EMPTY on the client — secrets live
 *   in the Fastify `server/` workspace and are reachable only through
 *   proxied `/api/*` routes. Server-only modules that read it
 *   (`config/get-secret-config.ts`) must never be pulled into the browser
 *   bundle; if they are, they now surface `undefined` instead of leaking.
 */

export interface NextLikeConfig {
  serverRuntimeConfig: Record<string, string | undefined>;
  publicRuntimeConfig: {
    basePath: string | undefined;
    developmentMode: boolean;
    collectMetrics: boolean;
  };
}

const config: NextLikeConfig = {
  serverRuntimeConfig: {},
  publicRuntimeConfig: {
    // BASE_URL is Vite's resolved `base` (from BASE_PATH in vite.config.ts);
    // '/' → '' matches Next's empty-basePath convention.
    basePath: import.meta.env.BASE_URL.replace(/\/+$/, '') || undefined,
    developmentMode: import.meta.env.DEV,
    // Metrics are collected by the Fastify api pod, never by the static web
    // bundle (the Next server used to host /api/metrics itself).
    collectMetrics: false,
  },
};

export default function getConfig(): NextLikeConfig {
  return config;
}
