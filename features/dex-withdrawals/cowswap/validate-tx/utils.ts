import mainnetNetwork from 'networks/mainnet.json';
import sepoliaNetwork from 'networks/sepolia.json';

import { getTokenAddress } from 'config/networks/token-address';

import { isAddress, isHex, type Address, type Hex } from 'viem';
import z from 'zod';

// ---- Contract addresses from network configs ----

// Keys from networks/*.json used for DEX token allowlist

const SELL_TOKEN_KEYS = ['lido', 'wsteth'] as const;
const BUY_TOKEN_KEYS = ['weth', 'usdc', 'usdt', 'usds', 'wbtc'] as const;
const DEX_TOKEN_KEYS = [...SELL_TOKEN_KEYS, ...BUY_TOKEN_KEYS] as const;

const collectTokenAddresses = (
  contracts: Record<string, Address>,
): Set<Address> => {
  const addresses = new Set<Address>();
  for (const key of DEX_TOKEN_KEYS) {
    const addr = contracts[key];
    if (addr) addresses.add(addr.toLowerCase() as Address);
  }
  return addresses;
};

const collectSellTokenAddresses = (
  contracts: Record<string, Address>,
): Set<Address> => {
  const addresses = new Set<Address>();
  for (const key of SELL_TOKEN_KEYS) {
    const addr = contracts[key];
    if (addr) addresses.add(addr.toLowerCase() as Address);
  }
  return addresses;
};

const collectBuyTokenAddresses = (
  contracts: Record<string, Address>,
): Set<Address> => {
  const addresses = new Set<Address>();
  for (const key of BUY_TOKEN_KEYS) {
    const addr = contracts[key];
    if (addr) addresses.add(addr.toLowerCase() as Address);
  }
  // 0xeeee...
  addresses.add(
    (getTokenAddress(1, 'eth') as Address).toLowerCase() as Address,
  );
  return addresses;
};

type NetworkTxConfig = {
  tokens: Set<Address>;
  sellTokens: Set<Address>;
  buyTokens: Set<Address>;
  cowVaultRelayer: Address;
  cowSettlement: Address;
};

const buildNetworkTxConfig = (
  contracts: Record<string, Address>,
): NetworkTxConfig => ({
  tokens: collectTokenAddresses(contracts),
  sellTokens: collectSellTokenAddresses(contracts),
  buyTokens: collectBuyTokenAddresses(contracts),
  cowVaultRelayer: contracts.cowVaultRelayer.toLowerCase() as Address,
  cowSettlement: contracts.cowSettlement.toLowerCase() as Address,
});

const MAINNET_CONFIG = buildNetworkTxConfig(
  mainnetNetwork.contracts as Record<string, Address>,
);
const SEPOLIA_CONFIG = buildNetworkTxConfig(
  sepoliaNetwork.contracts as Record<string, Address>,
);

// ---- Types ----

export type ValidationResult<T = never> = {
  allowed: boolean;
  reason?: string;
} & ([T] extends [never]
  ? object
  : { allowed: true; result: T } | { allowed: false; result?: undefined });

// ---- Helpers ----

export const getNetworkTxConfig = (chainId: number): NetworkTxConfig => {
  if (chainId === 11155111) return SEPOLIA_CONFIG;
  return MAINNET_CONFIG;
};

// ---- Schemas -----

export const addressSchema = z
  .string()
  .refine((address) => isAddress(address, { strict: false }), {
    message: 'Invalid Ethereum address',
  })
  .transform((address) => address.toLowerCase() as Address);

export const bigintStringSchema = z
  .string()
  .refine(
    (str) => {
      try {
        const result = BigInt(str);
        return result >= 0n;
      } catch {
        return false;
      }
    },
    { message: 'Invalid bigint string' },
  )
  .transform((str) => BigInt(str)) as z.ZodType<bigint>;

export const hexSchema = z.string().refine((hash) => isHex(hash), {
  message: 'Invalid hex string',
}) as z.ZodType<Hex>;
