import { isAddressEqual } from 'viem';
import { sepolia } from 'viem/chains';
import { z } from 'zod';

import {
  addressSchema,
  getNetworkTxConfig,
  ValidationResult,
  jsonStringSchema,
  AppDataSchema,
  getAppDataHex,
  cowSwapSignTypedDataSchema,
  ValidationContext,
  OrderData,
  cowSwapOrderSchema,
  cowSwapCancelOrderSchema,
} from './utils';
import {
  MAX_ORDER_AGE_SECONDS,
  COWSWAP_APPDATA_API,
  COWSWAP_API_TIMEOUT_MS,
} from '../consts';

import { standardFetcher } from 'utils/standardFetcher';
import { TRANSACTION_ERROR } from './consts';

const typedMessageSchema = z.tuple([
  addressSchema, // signer
  jsonStringSchema(cowSwapSignTypedDataSchema),
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
    throw new Error(TRANSACTION_ERROR(2003));
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
      reason: TRANSACTION_ERROR(2004),
    };
  }

  if (!buyTokens.has(orderMessage.buyToken)) {
    return {
      allowed: false,
      reason: TRANSACTION_ERROR(2005),
    };
  }

  if (!isAddressEqual(orderMessage.receiver, ctx.signer)) {
    return {
      allowed: false,
      reason: TRANSACTION_ERROR(2006),
    };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);

  if (orderMessage.validTo - nowSeconds > MAX_ORDER_AGE_SECONDS) {
    return {
      allowed: false,
      reason: TRANSACTION_ERROR(2007),
    };
  }
  if (orderMessage.validTo < nowSeconds) {
    return {
      allowed: false,
      reason: TRANSACTION_ERROR(2008),
    };
  }

  if (appDataPrefetched) {
    const parseResult = AppDataSchema.safeParse(appDataPrefetched); // validate prefetched app data
    if (!parseResult.success) {
      return {
        allowed: false,
        reason: TRANSACTION_ERROR(2009),
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
        reason: TRANSACTION_ERROR(2010),
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
        reason: TRANSACTION_ERROR(2011),
      };
    }

    const appDataHex = getAppDataHex(appData);

    if (appDataHex !== orderMessage.appData) {
      return {
        allowed: false,
        reason: TRANSACTION_ERROR(2012),
      };
    }
  } catch (error) {
    return {
      allowed: false,
      reason: TRANSACTION_ERROR(2013),
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
      reason: TRANSACTION_ERROR(2014),
    };
  }

  const { cowSettlement } = getNetworkTxConfig(ctx.chainId);

  if (!isAddressEqual(order.domain.verifyingContract, cowSettlement)) {
    return {
      allowed: false,
      reason: TRANSACTION_ERROR(2015),
    };
  }

  return await validateCowSwapOrderMessage(order.message, ctx);
};

export const validateCowSwapCancelOrder = async (
  order: z.infer<typeof cowSwapCancelOrderSchema>,
  ctx: ValidationContext,
): Promise<ValidationResult<undefined>> => {
  if (order.domain.chainId !== ctx.chainId) {
    return {
      allowed: false,
      reason: TRANSACTION_ERROR(2020),
    };
  }

  const { cowSettlement } = getNetworkTxConfig(ctx.chainId);

  if (!isAddressEqual(order.domain.verifyingContract, cowSettlement)) {
    return {
      allowed: false,
      reason: TRANSACTION_ERROR(2021),
    };
  }

  return { allowed: true, result: undefined };
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
      reason: TRANSACTION_ERROR(2016),
    };
  }

  const [signer, order] = parseResult.data;

  if (!isAddressEqual(signer, ctx.signer)) {
    return {
      allowed: false,
      reason: TRANSACTION_ERROR(2017),
    };
  }

  if (order.primaryType === 'OrderCancellations')
    return validateCowSwapCancelOrder(order, ctx);

  return await validateCowSwapOrder(order, ctx);
};
