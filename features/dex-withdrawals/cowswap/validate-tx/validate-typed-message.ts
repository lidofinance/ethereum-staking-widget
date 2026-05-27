import invariant from 'tiny-invariant';
import {
  isAddressEqual,
  Address,
  keccak256,
  toHex,
  hexToBytes,
  Hex,
} from 'viem';
import z from 'zod';

// eslint-disable-next-line import/no-extraneous-dependencies
import { MetadataApi } from '@cowprotocol/sdk-app-data';

import { getTokenAddress } from 'config/networks/token-address';

import {
  addressSchema,
  bigintStringSchema,
  hexSchema,
  getNetworkTxConfig,
  ValidationResult,
} from './utils';
import {
  MAX_WSTETH_PERMIT_AGE_SECONDS,
  MAX_ORDER_AGE_SECONDS,
  LIDO_APP_CODE,
  PARTNER_FEE_BPS,
  MAX_SLIPPAGE,
  COWSWAP_APPDATA_API,
} from '../consts';

import { standardFetcher } from 'utils/standardFetcher';

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

const wstethPermitSchema = z.object({
  domain: z.object({
    name: z.literal('Wrapped liquid staked Ether 2.0'),
    verifyingContract: addressSchema,
    chainId: z.number(),
    version: z.literal('1'),
  }),
  message: z.object({
    owner: addressSchema,
    spender: addressSchema,
    value: bigintStringSchema,
    nonce: z.number(),
    deadline: z.number(),
  }),
  primaryType: z.literal('Permit'),
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
    Permit: z.tuple([
      z.object({ name: z.literal('owner'), type: z.literal('address') }),
      z.object({ name: z.literal('spender'), type: z.literal('address') }),
      z.object({ name: z.literal('value'), type: z.literal('uint256') }),
      z.object({ name: z.literal('nonce'), type: z.literal('uint256') }),
      z.object({ name: z.literal('deadline'), type: z.literal('uint256') }),
    ]),
  }),
});

const typedMessageSchema = z.tuple([
  addressSchema, // signer
  jsonStringSchema(z.union([cowSwapOrderSchema, wstethPermitSchema])),
]);

type ValidationContext = {
  chainId: number;
  signer: Address;
};

export type OrderData = z.infer<typeof cowSwapOrderSchema>['message'];

const AppDataApiResponseSchema = z.object({
  fullAppData: jsonStringSchema(
    z.object({
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
      }),
      version: z.string(),
    }),
  ),
});

const fetchAppData = async (
  appDataHex: string,
  chainId: number,
): Promise<z.infer<typeof AppDataApiResponseSchema>['fullAppData']> => {
  const environment = chainId === 11155111 ? 'sepolia' : 'mainnet';

  const result = await standardFetcher(
    COWSWAP_APPDATA_API(appDataHex, environment),
    { method: 'GET' },
  );
  const parseResult = AppDataApiResponseSchema.safeParse(result);

  if (!parseResult.success) {
    throw new Error(`Invalid app data response: ${parseResult.error}`);
  }

  return parseResult.data.fullAppData;
};

const validateCowSwapOrder = async (
  order: z.infer<typeof cowSwapOrderSchema>,
  ctx: ValidationContext,
): Promise<ValidationResult<OrderData>> => {
  if (order.domain.chainId !== ctx.chainId) {
    return {
      allowed: false,
      reason: `Chain ID mismatch. Expected ${ctx.chainId}, got ${order.domain.chainId}`,
    };
  }

  const { sellTokens, buyTokens, cowSettlement, feeRecipient } =
    getNetworkTxConfig(ctx.chainId);

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

  if (!isAddressEqual(order.message.receiver, ctx.signer)) {
    return {
      allowed: false,
      reason: `Receiver address cannot be different from the signer address`,
    };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);

  if (order.message.validTo - nowSeconds > MAX_ORDER_AGE_SECONDS) {
    return {
      allowed: false,
      reason: `Order validTo is too far in the future. validTo: ${order.message.validTo}, now: ${nowSeconds}`,
    };
  }
  if (order.message.validTo < nowSeconds) {
    return {
      allowed: false,
      reason: `Order validTo has already passed. validTo: ${order.message.validTo}, now: ${nowSeconds}`,
    };
  }

  const appData = await fetchAppData(order.message.appData, ctx.chainId);

  if (!isAddressEqual(appData.metadata.partnerFee.recipient, feeRecipient)) {
    return {
      allowed: false,
      reason: `Partner fee recipient mismatch. Expected ${feeRecipient}, got ${appData.metadata.partnerFee.recipient}`,
    };
  }

  try {
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
    const info = await api.getAppDataInfo(appData);

    if (info.appDataHex !== order.message.appData) {
      return {
        allowed: false,
        reason: `App data mismatch. Expected ${order.message.appData}, got ${info.appDataHex}`,
      };
    }
  } catch (error) {
    return {
      allowed: false,
      reason: `Failed to fetch or validate app data: ${(error as Error).message}`,
    };
  }

  return {
    allowed: true,
    result: {
      ...order.message,
    },
  };
};

const validateWstEthPermit = (
  permit: z.infer<typeof wstethPermitSchema>,
  ctx: ValidationContext,
): ValidationResult<undefined> => {
  if (permit.domain.chainId !== ctx.chainId) {
    return {
      allowed: false,
      reason: `Chain ID mismatch. Expected ${ctx.chainId}, got ${permit.domain.chainId}`,
    };
  }

  const wsteth = getTokenAddress(ctx.chainId, 'wsteth');
  const { cowVaultRelayer } = getNetworkTxConfig(ctx.chainId);
  invariant(wsteth, 'wstETH address not found for chainId ' + ctx.chainId);

  if (!isAddressEqual(permit.domain.verifyingContract, wsteth)) {
    return {
      allowed: false,
      reason: `Verifying contract mismatch. Expected ${wsteth}, got ${permit.domain.verifyingContract}`,
    };
  }

  if (!isAddressEqual(permit.message.owner, ctx.signer)) {
    return {
      allowed: false,
      reason: `Owner address cannot be different from the signer address`,
    };
  }

  if (!isAddressEqual(permit.message.spender, cowVaultRelayer)) {
    return {
      allowed: false,
      reason: `Spender must be CoW VaultRelayer (${cowVaultRelayer}), got ${permit.message.spender}`,
    };
  }

  if (permit.message.value <= 0n) {
    return {
      allowed: false,
      reason: `Permit value must be greater than 0`,
    };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);

  if (permit.message.deadline - nowSeconds > MAX_WSTETH_PERMIT_AGE_SECONDS) {
    return {
      allowed: false,
      reason: `Permit deadline is too far in the future. deadline: ${permit.message.deadline}, now: ${nowSeconds}`,
    };
  }

  if (permit.message.deadline < nowSeconds) {
    return {
      allowed: false,
      reason: `Permit deadline has passed`,
    };
  }

  return {
    allowed: true,
    result: undefined,
  };
};

/**
 * !!! Security note: this function mutates the params object to override the wstETH permit deadline.
 * Overrides the deadline of a wstETH permit to be ~2 days from now.
 * Returns new deadline timestamp
 */
const overridePermitDeadline = (params: any): number => {
  const newDeadline =
    Math.floor(Date.now() / 1000) + MAX_WSTETH_PERMIT_AGE_SECONDS;

  const parsed = JSON.parse(params[1]);
  parsed.message.deadline = newDeadline;
  params[1] = JSON.stringify(parsed);

  return newDeadline;
};

/**
 * Validates eth_signTypedData_v4 (EIP-712) parameters.
 * Returns the parsed OrderFields so that order values can be checked via trade guard
 */
export const validateSignTypedData = async (
  params: unknown,
  ctx: ValidationContext,
): Promise<ValidationResult<OrderData | undefined>> => {
  const parseResult = typedMessageSchema.safeParse(params);

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

  if (order.primaryType === 'Order') {
    return await validateCowSwapOrder(order, ctx);
  }

  if (order.primaryType === 'Permit') {
    const deadline = overridePermitDeadline(params);
    order.message.deadline = deadline;
    return validateWstEthPermit(order, ctx);
  }

  invariant(false, 'Unreachable code');
};
