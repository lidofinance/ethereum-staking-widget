import type { Address } from 'viem';
import type { OnTradeParamsPayload } from '@cowprotocol/events';

// True when the widget selected a sell token outside the profile allowlist
export const shouldRefreshForSellToken = (
  payload: OnTradeParamsPayload,
  sellTokens: ReadonlySet<Address>,
): boolean => {
  const address = payload.sellToken?.address?.toLowerCase();

  return !!address && !sellTokens.has(address as Address);
};
