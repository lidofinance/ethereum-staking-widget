import { CHAIN_LIST } from './chains';

/**
 * THE single source of truth for frontend runtime env — the "one image,
 * many envs" contract. Adding an entry here is the only step needed to
 * expose a new env var to the browser config:
 *
 *  - `config/dynamics.ts` normalizes every entry into the typed `config`
 *    object (converter chosen by `type`, `fallback` applied when the value
 *    is absent);
 *  - `scripts/vite/window-env-plugin.ts` serializes the entries into the
 *    window-env JSON data element for dev serve / IPFS builds / preview,
 *    and emits `window-env-manifest.txt` into the web build for the nginx
 *    entrypoint (infra/nginx/entrypoint.sh), whose generic loop writes the
 *    same JSON from container env at boot — the shell never needs to know
 *    the variables.
 *
 * `presence` entries ship only "true"/"false" — the value itself (e.g. an
 * api-pod file path) must never reach the browser.
 */

interface EnvEntryBase {
  /** Environment variable the value comes from. */
  env: string;
}

export type EnvEntry =
  | (EnvEntryBase & { type: 'string'; fallback: string })
  | (EnvEntryBase & { type: 'optionalString' })
  | (EnvEntryBase & { type: 'boolean' })
  | (EnvEntryBase & { type: 'number'; fallback: number })
  | (EnvEntryBase & { type: 'numberList'; fallback: readonly number[] })
  | (EnvEntryBase & { type: 'presence' });

export const ENV_MANIFEST = {
  ipfsMode: { env: 'IPFS_MODE', type: 'boolean' },
  isProd: { env: 'IS_PROD', type: 'boolean' },
  selfOrigin: {
    env: 'SELF_ORIGIN',
    type: 'string',
    fallback: 'https://stake.lido.fi',
  },
  rootOrigin: {
    env: 'ROOT_ORIGIN',
    type: 'string',
    fallback: 'https://lido.fi',
  },
  docsOrigin: {
    env: 'DOCS_ORIGIN',
    type: 'string',
    fallback: 'https://docs.lido.fi',
  },
  helpOrigin: {
    env: 'HELP_ORIGIN',
    type: 'string',
    fallback: 'https://help.lido.fi',
  },
  researchOrigin: {
    env: 'RESEARCH_ORIGIN',
    type: 'string',
    fallback: 'https://research.lido.fi',
  },
  blogOrigin: {
    env: 'BLOG_ORIGIN',
    type: 'string',
    fallback: 'https://blog.lido.fi',
  },
  // Keep fallbacks as in 'config/get-secret-config.ts'
  defaultChain: { env: 'DEFAULT_CHAIN', type: 'number', fallback: 560048 },
  supportedChains: {
    env: 'SUPPORTED_CHAINS',
    type: 'numberList',
    fallback: [560048],
  },
  manifestOverride: { env: 'MANIFEST_OVERRIDE', type: 'optionalString' },
  enableQaHelpers: { env: 'ENABLE_QA_HELPERS', type: 'boolean' },
  walletconnectProjectId: {
    env: 'WALLETCONNECT_PROJECT_ID',
    type: 'optionalString',
  },
  matomoHost: { env: 'MATOMO_URL', type: 'optionalString' },
  ethAPIBasePath: { env: 'ETH_API_BASE_PATH', type: 'optionalString' },
  wqAPIBasePath: { env: 'WQ_API_BASE_PATH', type: 'optionalString' },
  rewardsBackendBasePath: {
    env: 'REWARDS_BACKEND_BASE_PATH',
    type: 'optionalString',
  },
  devnetOverrides: { env: 'DEVNET_OVERRIDES', type: 'optionalString' },
  addressApiValidationEnabled: {
    env: 'VALIDATION_SERVICE_BASE_PATH',
    type: 'presence',
  },
  useValidationFile: { env: 'VALIDATION_FILE_PATH', type: 'presence' },
  useConfigManifestFile: { env: 'CONFIG_MANIFEST_PATH', type: 'presence' },
} as const satisfies Record<string, EnvEntry>;

/**
 * Per-chain prefill RPC lists — flat `prefillUnsafeElRpcUrls<chainId>` wire
 * keys derived from CHAIN_LIST; `config/dynamics.ts` assembles them into
 * the nested `prefillUnsafeElRpcUrls` map the app consumes.
 */
export const PREFILL_RPC_ENTRIES = CHAIN_LIST.map((chainId) => ({
  chainId,
  key: `prefillUnsafeElRpcUrls${chainId}`,
  env: `PREFILL_UNSAFE_EL_RPC_URLS_${chainId}`,
}));

/** Every wire entry: [jsonKey, envVarName, kind] — the shape the nginx
 * entrypoint's manifest file mirrors line by line. */
export const windowEnvWireEntries = (): [
  key: string,
  env: string,
  kind: 'value' | 'presence',
][] => [
  ...Object.entries(ENV_MANIFEST).map(
    ([key, entry]): [string, string, 'value' | 'presence'] => [
      key,
      entry.env,
      entry.type === 'presence' ? 'presence' : 'value',
    ],
  ),
  ...PREFILL_RPC_ENTRIES.map(
    ({ key, env }): [string, string, 'value' | 'presence'] => [
      key,
      env,
      'value',
    ],
  ),
];

/**
 * Node-side twin of the entrypoint loop: raw STRING values from `env` per
 * manifest — presence entries always emitted as "true"/"false", other
 * unset entries omitted (browser-side fallbacks apply). Values stay
 * strings on the wire in every mode, so dev exercises the same
 * normalization paths as production.
 */
export const readWindowEnv = (
  env: Record<string, string | undefined> = typeof process !== 'undefined' &&
  process.env
    ? process.env
    : {},
): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [key, envName, kind] of windowEnvWireEntries()) {
    const value = env[envName];
    if (kind === 'presence') {
      out[key] = value ? 'true' : 'false';
    } else if (value !== undefined && value !== '') {
      out[key] = value;
    }
  }
  return out;
};
