import { isAddressEqual } from 'viem';
import { z } from 'zod';

import {
  MAX_ORDER_AGE_SECONDS,
  COWSWAP_API_NETWORKS,
  COWSWAP_APPDATA_API,
  COWSWAP_API_TIMEOUT_MS,
} from '../../../consts';
import { TRANSACTION_ERROR } from '../consts';

import { standardFetcher } from 'utils/standardFetcher';

import { getAppDataHex } from './app-data';
import {
  addressSchema,
  jsonStringSchema,
  AppDataSchema,
  cowSwapSignTypedDataSchema,
  cowSwapOrderSchema,
  cowSwapCancelOrderSchema,
} from './schemas';
import { deny } from './deny';
import {
  ValidationContext,
  ValidationResult,
  OrderData,
  AppData,
} from './types';

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
): Promise<AppData> => {
  const environment = COWSWAP_API_NETWORKS[chainId];
  if (!environment) throw new Error(TRANSACTION_ERROR(2001));

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
  orderMessage: OrderData,
  ctx: ValidationContext,
  appDataPrefetched?: AppData,
): Promise<ValidationResult<OrderData>> => {
  const { sellTokens, buyTokens, feeRecipient } = ctx.networkTxConfig;

  if (!sellTokens.has(orderMessage.sellToken)) {
    return deny(2004);
  }

  if (!buyTokens.has(orderMessage.buyToken)) {
    return deny(2005);
  }

  if (isAddressEqual(orderMessage.sellToken, orderMessage.buyToken)) {
    return deny(2039);
  }

  // Settlement debits sellAmount + feeAmount; CoW orders are zero-fee
  if (orderMessage.feeAmount !== 0n) {
    return deny(2050);
  }

  if (!isAddressEqual(orderMessage.receiver, ctx.signer)) {
    return deny(2006);
  }

  const nowSeconds = Math.floor(Date.now() / 1000);

  if (orderMessage.validTo - nowSeconds > MAX_ORDER_AGE_SECONDS) {
    return deny(2007);
  }
  if (orderMessage.validTo < nowSeconds) {
    return deny(2008);
  }

  if (appDataPrefetched) {
    const parseResult = AppDataSchema.safeParse(appDataPrefetched); // validate prefetched app data
    if (!parseResult.success) {
      return deny(2009);
    }
  }

  try {
    const appData =
      appDataPrefetched ??
      (await fetchAppData(orderMessage.appData, ctx.chainId));

    if (appData.appCode !== ctx.appCode) {
      return deny(2038);
    }

    if (!isAddressEqual(appData.metadata.partnerFee.recipient, feeRecipient)) {
      return deny(2010);
    }

    // Disallow hooks
    // NB! we can allow specific hooks later like permit applying to wstETH
    if (
      appData.metadata.hooks &&
      ((appData.metadata.hooks.pre?.length ?? 0) > 0 ||
        (appData.metadata.hooks.post?.length ?? 0) > 0)
    ) {
      return deny(2011);
    }

    const appDataHex = getAppDataHex(appData);

    if (appDataHex !== orderMessage.appData) {
      return deny(2012);
    }
  } catch (error) {
    return deny(2013);
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
    return deny(2014);
  }

  const { cowSettlement } = ctx.networkTxConfig;

  if (!isAddressEqual(order.domain.verifyingContract, cowSettlement)) {
    return deny(2015);
  }

  return await validateCowSwapOrderMessage(order.message, ctx);
};

export const validateCowSwapCancelOrder = async (
  order: z.infer<typeof cowSwapCancelOrderSchema>,
  ctx: ValidationContext,
): Promise<ValidationResult<undefined>> => {
  if (order.domain.chainId !== ctx.chainId) {
    return deny(2057);
  }

  const { cowSettlement } = ctx.networkTxConfig;

  if (!isAddressEqual(order.domain.verifyingContract, cowSettlement)) {
    return deny(2021);
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
    return deny(2017);
  }

  if (order.primaryType === 'OrderCancellations')
    return validateCowSwapCancelOrder(order, ctx);

  return await validateCowSwapOrder(order, ctx);
};
