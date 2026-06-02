import {
  encodePacked,
  hashTypedData,
  hexToBytes,
  isAddress,
  isHex,
  keccak256,
  toHex,
  type Address,
  type Hex,
} from 'viem';
import { sepolia } from 'viem/chains';
import z from 'zod';
// This is transitive dependency of @cowprotocol/widget-react, so it's version always tied to it
// eslint-disable-next-line import/no-extraneous-dependencies
import { MetadataApi } from '@cowprotocol/sdk-app-data';

import { getTokenAddress } from 'config/networks/token-address';

import mainnetNetwork from 'networks/mainnet.json';
import sepoliaNetwork from 'networks/sepolia.json';

import { LIDO_APP_CODE, MAX_SLIPPAGE, PARTNER_FEE_BPS } from '../consts';

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
  feeRecipient: Address;
};

const buildNetworkTxConfig = (
  contracts: Record<string, Address>,
): NetworkTxConfig => ({
  tokens: collectTokenAddresses(contracts),
  sellTokens: collectSellTokenAddresses(contracts),
  buyTokens: collectBuyTokenAddresses(contracts),
  cowVaultRelayer: contracts.cowVaultRelayer.toLowerCase() as Address,
  cowSettlement: contracts.cowSettlement.toLowerCase() as Address,
  feeRecipient: contracts.daoAgent.toLowerCase() as Address,
});

const MAINNET_CONFIG = buildNetworkTxConfig(
  mainnetNetwork.contracts as Record<string, Address>,
);
const SEPOLIA_CONFIG = buildNetworkTxConfig(
  sepoliaNetwork.contracts as Record<string, Address>,
);

// ---- Schemas -----

export const jsonRpcRequestSchema = z.object({
  method: z.string(),
  params: z.array(z.unknown()).optional(),
  id: z.number().optional(),
});

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

export const jsonStringSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .string()
    .transform((str, ctx) => {
      try {
        return JSON.parse(str);
      } catch {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON' });
        return z.NEVER;
      }
    })
    .pipe(schema);

export const CowSwapGPv2OrderSchema = z.object({
  sellToken: addressSchema,
  buyToken: addressSchema,
  sellAmount: bigintStringSchema,
  buyAmount: bigintStringSchema,
  validTo: z.number(),
  kind: z.literal('sell'),
  partiallyFillable: z.literal(false),
  appData: hexSchema,
  receiver: addressSchema,
  feeAmount: bigintStringSchema,
  sellTokenBalance: z.literal('erc20'),
  buyTokenBalance: z.literal('erc20'),
});

export const AppDataHooksSchema = z.object({
  callData: hexSchema,
  dappId: z.string(),
  gasLimit: bigintStringSchema,
  target: addressSchema,
});

export const AppDataSchema = z.object({
  appCode: z.literal(LIDO_APP_CODE),
  metadata: z.object({
    orderClass: z.object({
      orderClass: z.enum(['market']),
    }),
    partnerFee: z.object({
      recipient: addressSchema,
      volumeBps: z.literal(PARTNER_FEE_BPS),
    }),
    quote: z.object({
      slippageBips: z.number().lte(MAX_SLIPPAGE),
      smartSlippage: z.boolean(),
    }),
    widget: z.object({
      appCode: z.string(),
      environment: z.string(),
    }),
    hooks: z
      .object({
        pre: z.array(AppDataHooksSchema).optional(),
        post: z.array(AppDataHooksSchema).optional(),
      })
      .optional(),
  }),
  version: z.string(),
});

export const cowSwapOrderSchema = z.object({
  domain: z.object({
    name: z.literal('Gnosis Protocol'),
    version: z.literal('v2'),
    chainId: z.number(),
    verifyingContract: addressSchema,
  }),
  message: CowSwapGPv2OrderSchema,
  primaryType: z.literal('Order'),
  types: z.object({
    EIP712Domain: z.tuple([
      z.object({ name: z.literal('name'), type: z.literal('string') }),
      z.object({ name: z.literal('version'), type: z.literal('string') }),
      z.object({ name: z.literal('chainId'), type: z.literal('uint256') }),
      z.object({
        name: z.literal('verifyingContract'),
        type: z.literal('address'),
      }),
    ]),
    Order: z.tuple([
      z.object({ name: z.literal('sellToken'), type: z.literal('address') }),
      z.object({ name: z.literal('buyToken'), type: z.literal('address') }),
      z.object({ name: z.literal('receiver'), type: z.literal('address') }),
      z.object({ name: z.literal('sellAmount'), type: z.literal('uint256') }),
      z.object({ name: z.literal('buyAmount'), type: z.literal('uint256') }),
      z.object({ name: z.literal('validTo'), type: z.literal('uint32') }),
      z.object({ name: z.literal('appData'), type: z.literal('bytes32') }),
      z.object({ name: z.literal('feeAmount'), type: z.literal('uint256') }),
      z.object({ name: z.literal('kind'), type: z.literal('string') }),
      z.object({
        name: z.literal('partiallyFillable'),
        type: z.literal('bool'),
      }),
      z.object({
        name: z.literal('sellTokenBalance'),
        type: z.literal('string'),
      }),
      z.object({
        name: z.literal('buyTokenBalance'),
        type: z.literal('string'),
      }),
    ]),
  }),
});

// ---- Types ----

export type ValidationResult<T = never> = {
  allowed: boolean;
  reason?: string;
} & ([T] extends [never]
  ? object
  : { allowed: true; result: T } | { allowed: false; result?: undefined });

export type ValidationContext = {
  chainId: number;
  signer: Address;
};

export type OrderData = z.infer<typeof CowSwapGPv2OrderSchema>;

// ---- Helpers ----

export const getNetworkTxConfig = (chainId: number): NetworkTxConfig => {
  if (chainId === sepolia.id) return SEPOLIA_CONFIG;
  return MAINNET_CONFIG;
};

export const getAppDataHex = async (
  appData: z.infer<typeof AppDataSchema>,
): Promise<Hex> => {
  const api = new MetadataApi({
    // This crude hack absolves us from installing ethers.js
    utils: {
      // this two just pipe into each other so no need to match interface exactly between them
      toUtf8Bytes: (str: string): Hex => toHex(str),
      keccak256: (data: Hex): Hex => keccak256(data), //  just output hex string,
      // this is used later and must match interface
      arrayify: (hexString: Hex): Uint8Array => hexToBytes(hexString),
    },
  } as any);

  const { appDataHex } = await api.getAppDataInfo(appData);

  if (!isHex(appDataHex)) {
    throw new Error('Received invalid appDataHex from Metadata API');
  }

  return appDataHex;
};

export const hashCowswapOrder = (
  order: z.infer<typeof CowSwapGPv2OrderSchema>,
  chainId: number,
  cowSettler: Address,
): Hex => {
  const domain = {
    name: 'Gnosis Protocol',
    version: 'v2',
    chainId: chainId,
    verifyingContract: cowSettler,
  } as const;

  const types = {
    Order: [
      { name: 'sellToken', type: 'address' },
      { name: 'buyToken', type: 'address' },
      { name: 'receiver', type: 'address' },
      { name: 'sellAmount', type: 'uint256' },
      { name: 'buyAmount', type: 'uint256' },
      { name: 'validTo', type: 'uint32' },
      { name: 'appData', type: 'bytes32' },
      { name: 'feeAmount', type: 'uint256' },
      { name: 'kind', type: 'string' },
      { name: 'partiallyFillable', type: 'bool' },
      { name: 'sellTokenBalance', type: 'string' },
      { name: 'buyTokenBalance', type: 'string' },
    ],
  } as const;

  return hashTypedData({
    domain,
    types,
    primaryType: 'Order',
    message: order,
  });
};

export const calculateOrderUID = (
  orderHash: Hex,
  signer: Address,
  validTo: number,
): Hex => {
  // We use encodePacked to mimic Solidity's abi.encodePacked logic
  // which is how the UID is constructed in the CowSwap ecosystem.
  return encodePacked(
    ['bytes32', 'address', 'uint32'],
    [orderHash, signer, validTo],
  );
};
