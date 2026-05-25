import {
  decodeFunctionData,
  erc20Abi,
  isAddress,
  isAddressEqual,
  isHex,
  Address,
  Hex,
  hexToBigInt,
} from 'viem';
import z from 'zod';

import mainnetNetwork from 'networks/mainnet.json';
import sepoliaNetwork from 'networks/sepolia.json';

import { getTokenAddress } from 'config/networks/token-address';

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

const getNetworkTxConfig = (chainId: number): NetworkTxConfig => {
  if (chainId === 11155111) return SEPOLIA_CONFIG;
  return MAINNET_CONFIG;
};

const validateApproveSpender = (
  data: string,
  cowVaultRelayer: Address,
): ValidationResult => {
  try {
    const { functionName, args } = decodeFunctionData({
      abi: erc20Abi,
      data: data as Hex,
    });

    if (functionName !== 'approve' || !args) {
      return {
        allowed: false,
        reason: `Expected approve(), got ${functionName}()`,
      };
    }

    const spender = args[0];
    if (!isAddressEqual(spender, cowVaultRelayer)) {
      return {
        allowed: false,
        reason: `approve() spender must be CoW VaultRelayer (${cowVaultRelayer}), got ${spender}`,
      };
    }

    return { allowed: true };
  } catch {
    return { allowed: false, reason: 'Cannot decode approve() calldata' };
  }
};

// ================================================================
//  Public validation functions
// ================================================================

const addressSchema = z
  .string()
  .refine((address) => isAddress(address, { strict: false }), {
    message: 'Invalid Ethereum address',
  })
  .transform((address) => address.toLowerCase() as Address);

const bigintStringSchema = z
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

const hexSchema = z.string().refine((hash) => isHex(hash), {
  message: 'Invalid hex string',
}) as z.ZodType<Hex>;

const sendTransactionParamsSchema = z.tuple([
  z.object({
    to: addressSchema,
    from: addressSchema.optional(),
    data: hexSchema,
    gas: hexSchema.optional(),
    value: hexSchema.optional(),
  }),
]);

/**
 * Validates eth_sendTransaction parameters.
 *
 * Rules:
 * - Contract creation (no `to`): blocked
 * - Unknown target address: blocked
 * - CoW Protocol contracts (Settlement, VaultRelayer): any call allowed
 * - Other tokens: approve() only, spender must be VaultRelayer, no ETH value
 */
export const validateSendTransaction = (
  params: unknown,
  chainId: number,
): ValidationResult => {
  const parseResult = sendTransactionParamsSchema.safeParse(params);

  if (!parseResult.success) {
    return {
      allowed: false,
      reason: `Invalid transaction parameters: ${parseResult.error}`,
    };
  }

  const { to: txTo, data, value } = parseResult.data[0];

  if (value && hexToBigInt(value) > 0n) {
    return {
      allowed: false,
      reason: `ETH value is not allowed in transactions`,
    };
  }

  const { tokens, cowVaultRelayer, cowSettlement } =
    getNetworkTxConfig(chainId);
  const allowedTargets = new Set([...tokens, cowVaultRelayer, cowSettlement]);

  if (!allowedTargets.has(txTo.toLocaleLowerCase() as Address)) {
    return {
      allowed: false,
      reason: `Transaction to ${txTo} is not allowed. Only token contracts and CoW Protocol addresses are permitted.`,
    };
  }
  const isCowSwapContract =
    isAddressEqual(txTo, cowVaultRelayer) ||
    isAddressEqual(txTo, cowSettlement);
  // CoW Protocol contracts — trust any call
  if (isCowSwapContract) return { allowed: true };

  // Other tokens — only approve(), no ETH value
  if (tokens.has(txTo)) {
    return validateApproveSpender(data, cowVaultRelayer);
  }

  return { allowed: false, reason: `Unexpected target: ${txTo}` };
};

const sendCallsParamsSchema = z.tuple([
  z.object({
    calls: z
      .array(
        z.object({
          to: addressSchema,
          data: hexSchema,
          value: hexSchema.optional(),
        }),
      )
      .min(1, { message: 'calls array cannot be empty' })
      .max(10, { message: 'calls array cannot have more than 10 items' }),
  }),
]);

/**
 * Validates wallet_sendCalls (EIP-5792 batch) parameters.
 * Each call in the batch is validated with the same rules as eth_sendTransaction.
 */
export const validateSendCalls = (
  params: unknown,
  chainId: number,
): ValidationResult => {
  const parseResult = sendCallsParamsSchema.safeParse(params);

  if (!parseResult.success) {
    return {
      allowed: false,
      reason: `Invalid sendCalls parameters: ${parseResult.error}`,
    };
  }

  const calls = parseResult.data[0].calls;

  for (const [i, call] of calls.entries()) {
    const result = validateSendTransaction([call], chainId);
    if (!result.allowed) {
      return {
        allowed: false,
        reason: `Call #${i} in batch blocked: ${result.reason}`,
      };
    }
  }

  return { allowed: true };
};

const jsonStringSchema = <T extends z.ZodTypeAny>(schema: T) =>
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

const cowSwapOrderSchema = z.object({
  domain: z.object({
    name: z.literal('Gnosis Protocol'),
    version: z.literal('v2'),
    chainId: z.number(),
    verifyingContract: addressSchema,
  }),
  message: z.object({
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
  }),
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

const cowSwapTypeDataSchema = z.tuple([
  addressSchema, // signer
  jsonStringSchema(cowSwapOrderSchema),
]);

type ValidationContext = {
  chainId: number;
  signer: Address;
};

export type OrderData = z.infer<typeof cowSwapOrderSchema>['message'];

/**
 * Validates eth_signTypedData_v4 (EIP-712) parameters.
 * Returns the parsed OrderFields so that order values can be checked via trade guard
 */
export const validateSignTypedData = (
  params: unknown,
  ctx: ValidationContext,
): ValidationResult<OrderData> => {
  const parseResult = cowSwapTypeDataSchema.safeParse(params);

  if (!parseResult.success) {
    return {
      allowed: false,
      result: undefined,
      reason: `Invalid signTypedData parameters: ${parseResult.error}`,
    };
  }

  const [signer, order] = parseResult.data;

  if (!isAddressEqual(signer, ctx.signer)) {
    return {
      allowed: false,
      reason: `Signer address mismatch. Expected ${ctx.signer}, got ${signer}`,
    };
  }

  if (order.domain.chainId !== ctx.chainId) {
    return {
      allowed: false,
      reason: `Chain ID mismatch. Expected ${ctx.chainId}, got ${order.domain.chainId}`,
    };
  }

  const { sellTokens, buyTokens, cowSettlement } = getNetworkTxConfig(
    ctx.chainId,
  );

  if (!isAddressEqual(order.domain.verifyingContract, cowSettlement)) {
    return {
      allowed: false,
      reason: `Verifying contract mismatch. Expected ${cowSettlement}, got ${order.domain.verifyingContract}`,
    };
  }

  if (!sellTokens.has(order.message.sellToken)) {
    return {
      allowed: false,
      reason: `Sell token ${order.message.sellToken} is not in the allowed list`,
    };
  }

  if (!buyTokens.has(order.message.buyToken)) {
    return {
      allowed: false,
      reason: `Buy token ${order.message.buyToken} is not in the allowed list`,
    };
  }

  if (!isAddressEqual(order.message.receiver, signer)) {
    return {
      allowed: false,
      reason: `Receiver address cannot be different from the signer address`,
    };
  }

  return {
    allowed: true,
    result: {
      ...order.message,
    },
  };
};
