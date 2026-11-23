import { isIPv6 } from 'net';
import { LRUCache } from 'lru-cache';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_CLIENTS = 20_000;
const IPV6_GROUPS = 8;
const PREFIX_GROUPS = 4;
const NETWORK_GROUPS = 3;
// a /48 is one site with many /64, so it gets this many times the limits
const NETWORK_FACTOR = 16;

export type ClientLimitScope = 'positions' | 'rewards' | 'history';
export type ClientLimitName = 'addresses' | ClientLimitScope;
// per client and window: distinct wallets, and upstream calls per scope
export type ClientLimits = Record<ClientLimitName, number>;

export class ClientLimitError extends Error {
  constructor(
    readonly limit: ClientLimitName,
    readonly retryAfterSec: number,
  ) {
    super(`Portfolio client limit exceeded: ${limit}`);
  }
}

type ClientUsage = {
  resetAt: number;
  addresses: Set<string>;
  upstreamCalls: Record<ClientLimitScope, number>;
};

export type ClientLimiterOptions = {
  limits: ClientLimits;
  windowMs?: number;
  maxClients?: number;
  onLimit?: (limit: ClientLimitName) => void;
  now?: () => number;
};

export type ClientLimiter = {
  // throws ClientLimitError; a request without a client IP is not limited
  // returns a function that takes the counted call back when it was not made
  countRequest: (
    ip: string | undefined,
    address: string,
    scope: ClientLimitScope,
    isUpstreamCallNeeded: boolean,
  ) => () => void;
};

const nothingToUncount = () => undefined;

// one home network rotates addresses inside its /64
const toIpv6Prefix = (ip: string, groupCount = PREFIX_GROUPS): string => {
  const [leadingPart, trailingPart] = ip.toLowerCase().split('::');
  const leadingGroups = leadingPart ? leadingPart.split(':') : [];
  let allGroups = leadingGroups;
  if (trailingPart !== undefined) {
    const trailingGroups = trailingPart ? trailingPart.split(':') : [];
    // a dotted IPv4 tail stands for two groups
    const trailingGroupCount =
      trailingGroups.length + (trailingPart.includes('.') ? 1 : 0);
    const zeroGroups = Array.from(
      {
        length: Math.max(
          0,
          IPV6_GROUPS - leadingGroups.length - trailingGroupCount,
        ),
      },
      () => '0',
    );
    allGroups = [...leadingGroups, ...zeroGroups, ...trailingGroups];
  }
  return allGroups
    .slice(0, groupCount)
    .map((group) => group.replace(/^0+(?=.)/, ''))
    .join(':');
};

export const getClientKey = (ip: string): string =>
  isIPv6(ip) ? `${toIpv6Prefix(ip)}::/64` : ip;

// the /48 around an IPv6 client; IPv4 has no wider key
export const getNetworkKey = (ip: string): string | null =>
  isIPv6(ip) ? `${toIpv6Prefix(ip, NETWORK_GROUPS)}::/48` : null;

const scaleLimits = (limits: ClientLimits, factor: number): ClientLimits => ({
  addresses: limits.addresses * factor,
  positions: limits.positions * factor,
  history: limits.history * factor,
  rewards: limits.rewards * factor,
});

// in memory and per process, so a restart or another pod starts from zero
export const createClientLimiter = ({
  limits,
  windowMs = DAY_MS,
  maxClients = MAX_CLIENTS,
  onLimit,
  now = Date.now,
}: ClientLimiterOptions): ClientLimiter => {
  const usageByClient = new LRUCache<string, ClientUsage>({ max: maxClients });

  const getUsage = (usageKey: string, currentTime: number): ClientUsage => {
    const knownUsage = usageByClient.get(usageKey);
    if (knownUsage && currentTime < knownUsage.resetAt) return knownUsage;
    const usage: ClientUsage = {
      resetAt: currentTime + windowMs,
      addresses: new Set(),
      upstreamCalls: { positions: 0, rewards: 0, history: 0 },
    };
    usageByClient.set(usageKey, usage);
    return usage;
  };

  const networkLimits = scaleLimits(limits, NETWORK_FACTOR);

  return {
    countRequest: (ip, address, scope, isUpstreamCallNeeded) => {
      if (!ip) return nothingToUncount;
      const currentTime = now();
      const networkKey = getNetworkKey(ip);
      // the client itself, then its network: both must have room
      const counters = [
        {
          usage: getUsage(getClientKey(ip), currentTime),
          counterLimits: limits,
        },
        ...(networkKey
          ? [
              {
                usage: getUsage(networkKey, currentTime),
                counterLimits: networkLimits,
              },
            ]
          : []),
      ];

      for (const { usage, counterLimits } of counters) {
        const rejectOverLimit = (limit: ClientLimitName): never => {
          onLimit?.(limit);
          throw new ClientLimitError(
            limit,
            Math.max(1, Math.ceil((usage.resetAt - currentTime) / 1000)),
          );
        };

        const isNewAddress = !usage.addresses.has(address);
        if (isNewAddress && usage.addresses.size >= counterLimits.addresses) {
          rejectOverLimit('addresses');
        }
        if (
          isUpstreamCallNeeded &&
          usage.upstreamCalls[scope] >= counterLimits[scope]
        )
          rejectOverLimit(scope);
      }

      // a rejected request spends nothing
      for (const { usage } of counters) {
        usage.addresses.add(address);
        if (isUpstreamCallNeeded) usage.upstreamCalls[scope] += 1;
      }
      if (!isUpstreamCallNeeded) return nothingToUncount;

      let isCallUncounted = false;
      return () => {
        if (isCallUncounted) return;
        isCallUncounted = true;
        for (const { usage } of counters) {
          usage.upstreamCalls[scope] = Math.max(
            0,
            usage.upstreamCalls[scope] - 1,
          );
        }
      };
    },
  };
};
