/**
 * Categorize the incoming `Referer` header for the eth_call metric label.
 *
 * Bounds Prometheus label cardinality by mapping any incoming Referer to a
 * small allow-listed set of values. Anything outside the allow-list collapses
 * to `'unknown'`. Original Referer values, when needed for forensics, can be
 * recovered from nginx access logs by correlation on timestamp + IP + path.
 *
 * Allow-list captures: production widget hosts, preview/staging stands,
 * and known partner-embedded contexts (Ledger Live, Safe Wallet). IPFS
 * gateways are intentionally NOT matched (see note below). Extend cautiously —
 * every entry adds to the metric keyspace.
 */

const KNOWN_HOSTS = new Set<string>([
  // Production
  'stake.lido.fi',
  // Testnets / staging
  'stake-hoodi.testnet.fi',
  'stake-sepolia.testnet.fi',
  'stake.infra-staging.org',
  // Partner-embedded contexts (extend as confirmed)
  'live.ledger.com',
  'app.safe.global',
]);

const KNOWN_HOST_PATTERNS: RegExp[] = [
  // Per-PR preview stands
  /^pr-\d+\.[^.]+\.lidofinance\.dev$/,
];

// Note on IPFS: deliberately NOT pattern-matched. In IPFS build mode the
// widget is fully static and does NOT call `/api/*` routes (they don't exist
// in the static export). A Referer pointing at an IPFS gateway hitting any
// `/api/*` endpoint is therefore anomalous — collapse to 'unknown' and let
// the metric spike be the signal.

/**
 * Single canonical "unknown" string shared across all bounded prom-client
 * labels (referer / address / methodEncoded / contractName / methodDecoded).
 * Imported in nextApiWrappers.ts — keep them in sync.
 */
export const UNKNOWN_LABEL = 'unknown';

export const REFERER_NONE = 'none';
export const REFERER_INVALID = 'invalid';
export const REFERER_UNKNOWN = UNKNOWN_LABEL;

export const categorizeReferer = (referer: string | undefined): string => {
  if (!referer) return REFERER_NONE;
  let host: string;
  try {
    // .hostname strips the port — KNOWN_HOSTS contains bare hostnames, and we
    // don't want preview-stands on non-default ports to fall into 'unknown'.
    host = new URL(referer).hostname;
  } catch {
    return REFERER_INVALID;
  }
  if (!host) return REFERER_INVALID;
  if (KNOWN_HOSTS.has(host)) return host;
  if (KNOWN_HOST_PATTERNS.some((re) => re.test(host))) return host;
  return REFERER_UNKNOWN;
};
