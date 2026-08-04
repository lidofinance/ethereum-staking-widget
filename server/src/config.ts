import { z } from 'zod';

/**
 * Server-side config: secrets and RPC URLs that must never reach the client.
 * Replaces the `serverRuntimeConfig` block from next.config.mjs +
 * `config/get-secret-config.ts`.
 *
 * Chain set matches the current widget (Soneium 1868/1946 were dropped
 * 2026-06-17, commit adfad475): Mainnet, Holesky, Hoodi, Sepolia, Optimism,
 * OptimismSepolia, Unichain, UnichainSepolia.
 *
 * All RPC URL lists are comma-separated; consumers split.
 */
const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Rate limit (global, IP-based). RATE_LIMIT_TIME_FRAME is in SECONDS —
  // the long-standing `.env` convention; multiplied by 1000 at register.
  RATE_LIMIT: z.coerce.number().int().min(1).default(100),
  RATE_LIMIT_TIME_FRAME: z.coerce.number().int().min(1).default(60),

  // Chain selection
  DEFAULT_CHAIN: z.coerce.number().int().default(560048),
  SUPPORTED_CHAINS: z
    .string()
    .default('1,17000,11155111,560048,10,11155420,130,1301'),

  // ETH RPCs (per chain)
  EL_RPC_URLS_1: z.string().optional(),
  EL_RPC_URLS_17000: z.string().optional(),
  EL_RPC_URLS_11155111: z.string().optional(),
  EL_RPC_URLS_560048: z.string().optional(),
  EL_RPC_URLS_10: z.string().optional(),
  EL_RPC_URLS_11155420: z.string().optional(),
  EL_RPC_URLS_130: z.string().optional(),
  EL_RPC_URLS_1301: z.string().optional(),

  // External services
  ETH_API_BASE_PATH: z.string().optional(),
  REWARDS_BACKEND: z.string().optional(),
  VALIDATION_SERVICE_BASE_PATH: z.string().optional(),
  VALIDATION_FILE_PATH: z.string().optional(),
  // Manifest file mounted into the container (e.g. k8s configmap); presence
  // makes it the manifest source of truth (no remote fetch). Trimmed so a
  // whitespace-only env behaves like an unset one, same as the startup check.
  CONFIG_MANIFEST_PATH: z
    .string()
    .optional()
    .transform((v) => v?.trim() || undefined),

  // CSP
  CSP_TRUSTED_HOSTS: z.string().optional(),
  CSP_REPORT_URI: z.string().optional(),
  CSP_REPORT_ONLY: z.string().optional(),

  // Observability
  COLLECT_METRICS: z.coerce.boolean().default(true),

  // Operational
  MANIFEST_OVERRIDE: z.string().optional(),
  DEVNET_OVERRIDES: z.string().optional(),
});

export type ServerConfig = z.infer<typeof envSchema>;

/**
 * `config/groups/web3.ts` `PROVIDER_MAX_BATCH` — the browser SDK batches at
 * most 20 calls, so anything larger is not our client.
 */
export const PROVIDER_MAX_BATCH = 20;

const parseRpcUrls = (value: string | undefined): string[] => {
  return value
    ? value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
};

const load = (): ServerConfig => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid server config:\n${issues}`);
  }
  return parsed.data;
};

export const config = load();

export const rpcProviders: Record<number, string[]> = {
  1: parseRpcUrls(config.EL_RPC_URLS_1),
  17000: parseRpcUrls(config.EL_RPC_URLS_17000),
  11155111: parseRpcUrls(config.EL_RPC_URLS_11155111),
  560048: parseRpcUrls(config.EL_RPC_URLS_560048),
  10: parseRpcUrls(config.EL_RPC_URLS_10),
  11155420: parseRpcUrls(config.EL_RPC_URLS_11155420),
  130: parseRpcUrls(config.EL_RPC_URLS_130),
  1301: parseRpcUrls(config.EL_RPC_URLS_1301),
};

export const supportedChainIds = config.SUPPORTED_CHAINS.split(',')
  .map((s) => parseInt(s.trim(), 10))
  .filter((n) => Number.isFinite(n));
