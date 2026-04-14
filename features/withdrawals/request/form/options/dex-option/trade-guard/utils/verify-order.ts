import { VALID_SELL_TOKENS, VALID_BUY_TOKENS } from '../consts';

type OrderFields = {
  sellToken: string;
  buyToken: string;
  receiver: string;
};

export type { OrderFields };

/**
 * Defense-in-depth: verifies that an EIP-712 CowSwap order
 * matches the expected constraints before signing.
 *
 * Returns null if OK, or an error message if verification fails.
 */
export const verifyOrderFields = (
  order: OrderFields,
  walletAddress: string,
  isTestnet: boolean,
): string | null => {
  if (order.receiver.toLowerCase() !== walletAddress.toLowerCase()) {
    return 'Order receiver does not match wallet address';
  }

  if (!isTestnet) {
    if (!VALID_SELL_TOKENS.has(order.sellToken.toLowerCase())) {
      return 'Invalid sell token in order';
    }
    if (!VALID_BUY_TOKENS.has(order.buyToken.toLowerCase())) {
      return 'Invalid buy token in order';
    }
  }

  return null;
};

/**
 * Attempts to extract CowSwap Order fields from eth_signTypedData_v4 params.
 * Returns null if the request is not a CowSwap Order signing request.
 */
export const parseOrderFromSignRequest = (
  params: unknown,
): OrderFields | null => {
  try {
    const [, typedDataRaw] = params as [string, string | object];
    const typedData =
      typeof typedDataRaw === 'string' ? JSON.parse(typedDataRaw) : typedDataRaw;

    if (typedData?.primaryType === 'Order' && typedData?.message) {
      const msg = typedData.message;
      if (msg.sellToken && msg.buyToken && msg.receiver) {
        return msg as OrderFields;
      }
    }
  } catch {
    // Not valid typed data — ignore
  }
  return null;
};
