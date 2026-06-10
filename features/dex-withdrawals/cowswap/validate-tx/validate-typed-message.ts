import { isAddressEqual } from 'viem';
import { sepolia } from 'viem/chains';
import z from 'zod';

import {
  addressSchema,
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
  MAX_ORDER_AGE_SECONDS,
  COWSWAP_APPDATA_API,
  COWSWAP_API_TIMEOUT_MS,
} from '../consts';

import { standardFetcher } from 'utils/standardFetcher';

const typedMessageSchema = z.tuple([
  addressSchema, // signer
  jsonStringSchema(cowSwapOrderSchema),
]);

const AppDataApiResponseSchema = z.object({
  fullAppData: jsonStringSchema(AppDataSchema),
});

const fetchAppData = async (
  appDataHex: string,
  chainId: number,
): Promise<z.infer<typeof AppDataApiResponseSchema>['fullAppData']> => {
  const environment = chainId === sepolia.id ? 'sepolia' : 'mainnet';

  const result = await standardFetcher(
    COWSWAP_APPDATA_API(appDataHex, environment),
    { timeoutMs: COWSWAP_API_TIMEOUT_MS },
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
      reason: `Order validTo is too far in the future. validTo timestamp: ${orderMessage.validTo}`,
    };
  }
  if (orderMessage.validTo < nowSeconds) {
    return {
      allowed: false,
      reason: `Order validTo has already passed. validTo timestamp: ${orderMessage.validTo}`,
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

  // Only order type is supported, other message types are blocked on schema level
  return await validateCowSwapOrder(order, ctx);
};
