import invariant from 'tiny-invariant';
import { isAddressEqual } from 'viem';
import z from 'zod';

import { getTokenAddress } from 'config/networks/token-address';

import {
  addressSchema,
  bigintStringSchema,
  getNetworkTxConfig,
  ValidationResult,
  jsonStringSchema,
  AppDataSchema,
  getAppDataHex,
  cowSwapOrderSchema,
  ValidationContext,
  OrderData,
} from './utils';
import {
  MAX_WSTETH_PERMIT_AGE_SECONDS,
  MAX_ORDER_AGE_SECONDS,
  COWSWAP_APPDATA_API,
} from '../consts';

import { standardFetcher } from 'utils/standardFetcher';

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

const AppDataApiResponseSchema = z.object({
  fullAppData: jsonStringSchema(AppDataSchema),
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

export const validateCowSwapOrderMessage = async (
  orderMessage: z.infer<typeof cowSwapOrderSchema>['message'],
  ctx: ValidationContext,
  appDataPrefetched?: z.infer<typeof AppDataApiResponseSchema>['fullAppData'],
): Promise<ValidationResult<OrderData>> => {
  const { sellTokens, buyTokens, feeRecipient } = getNetworkTxConfig(
    ctx.chainId,
  );

  if (!sellTokens.has(orderMessage.sellToken)) {
    return {
      allowed: false,
      reason: `Sell token ${orderMessage.sellToken} is not in the allowed list`,
    };
  }

  if (!buyTokens.has(orderMessage.buyToken)) {
    return {
      allowed: false,
      reason: `Buy token ${orderMessage.buyToken} is not in the allowed list`,
    };
  }

  if (!isAddressEqual(orderMessage.receiver, ctx.signer)) {
    return {
      allowed: false,
      reason: `Receiver address cannot be different from the signer address`,
    };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);

  if (orderMessage.validTo - nowSeconds > MAX_ORDER_AGE_SECONDS) {
    return {
      allowed: false,
      reason: `Order validTo is too far in the future. validTo: ${orderMessage.validTo}, now: ${nowSeconds}`,
    };
  }
  if (orderMessage.validTo < nowSeconds) {
    return {
      allowed: false,
      reason: `Order validTo has already passed. validTo: ${orderMessage.validTo}, now: ${nowSeconds}`,
    };
  }

  if (appDataPrefetched) {
    const parseResult = AppDataSchema.safeParse(appDataPrefetched); // validate prefetched app data
    if (!parseResult.success) {
      return {
        allowed: false,
        reason: `Invalid order appData: ${parseResult.error}`,
      };
    }
  }

  try {
    const appData =
      appDataPrefetched ??
      (await fetchAppData(orderMessage.appData, ctx.chainId));

    if (!isAddressEqual(appData.metadata.partnerFee.recipient, feeRecipient)) {
      return {
        allowed: false,
        reason: `Partner fee recipient mismatch. Expected ${feeRecipient}, got ${appData.metadata.partnerFee.recipient}`,
      };
    }

    // Disallow hooks
    // NB! we can allow specific hooks later like permit applying to wstETH
    if (
      appData.metadata.hooks &&
      ((appData.metadata.hooks.pre?.length ?? 0) > 0 ||
        (appData.metadata.hooks.post?.length ?? 0) > 0)
    ) {
      return {
        allowed: false,
        reason: `Pre/Post Hooks are not allowed`,
      };
    }

    const appDataHex = await getAppDataHex(appData);

    if (appDataHex !== orderMessage.appData) {
      return {
        allowed: false,
        reason: `App data mismatch. Expected ${orderMessage.appData}, got ${appDataHex}`,
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
      ...orderMessage,
    },
  };
};

export const validateCowSwapOrder = async (
  order: z.infer<typeof cowSwapOrderSchema>,
  ctx: ValidationContext,
): Promise<ValidationResult<OrderData>> => {
  if (order.domain.chainId !== ctx.chainId) {
    return {
      allowed: false,
      reason: `Chain ID mismatch. Expected ${ctx.chainId}, got ${order.domain.chainId}`,
    };
  }

  const { cowSettlement } = getNetworkTxConfig(ctx.chainId);

  if (!isAddressEqual(order.domain.verifyingContract, cowSettlement)) {
    return {
      allowed: false,
      reason: `Verifying contract mismatch. Expected ${cowSettlement}, got ${order.domain.verifyingContract}`,
    };
  }

  return await validateCowSwapOrderMessage(order.message, ctx);
};

/**
 *
 * Used to validate wsteth permits if they are allowed
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  /** 

  NB! we disallow permits in cow swap widget config
  but if we want to allow them in the future, we can validate them here and override the deadline to prevent stale permits from being used
  will also need to add preHook validation in appData where permit is applied before trade
  */
  if (order.primaryType === 'Permit') {
    return {
      allowed: false,
      reason: `Permit messages are not allowed`,
    };
    // const deadline = overridePermitDeadline(params);
    // order.message.deadline = deadline;
    // return validateWstEthPermit(order, ctx);
  }

  invariant(false, 'Unreachable code');
};
