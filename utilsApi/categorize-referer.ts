/**
 * Maps the `Referer` header to a small allow-listed keyspace to bound
 * Prometheus label cardinality. Anything off the list collapses to 'unknown';
 * raw values can be recovered from nginx access logs when needed.
 *
 * IPFS gateways are intentionally NOT matched — IPFS builds are static and
 * don't call `/api/*`, so an IPFS-Referer on a server route is anomalous.
 */

const KNOWN_HOSTS = new Set<string>([
  'stake.lido.fi',
  'stake-hoodi.testnet.fi',
  'stake-sepolia.testnet.fi',
  'stake.infra-staging.org',
  'live.ledger.com',
  'app.safe.global',
]);

const KNOWN_HOST_PATTERNS: RegExp[] = [/^pr-\d+\.[^.]+\.lidofinance\.dev$/];

/** Shared with other bounded prom-client labels in nextApiWrappers.ts. */
export const UNKNOWN_LABEL = 'unknown';

export const REFERER_NONE = 'none';
export const REFERER_INVALID = 'invalid';
export const REFERER_UNKNOWN = UNKNOWN_LABEL;

export const categorizeReferer = (referer: string | undefined): string => {
  if (!referer) return REFERER_NONE;
  let host: string;
  try {
    // .hostname strips the port so KNOWN_HOSTS entries don't need ports.
    host = new URL(referer).hostname;
  } catch {
    return REFERER_INVALID;
  }
  if (!host) return REFERER_INVALID;
  if (KNOWN_HOSTS.has(host)) return host;
  if (KNOWN_HOST_PATTERNS.some((re) => re.test(host))) return host;
  return REFERER_UNKNOWN;
};
