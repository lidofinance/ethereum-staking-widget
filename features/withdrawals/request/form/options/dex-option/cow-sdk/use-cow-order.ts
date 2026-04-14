import { useCallback, useState } from 'react';
import type { Address } from 'viem';
import { useWalletClient } from 'wagmi';

import { useDappStatus } from 'modules/web3';
import { useAddressValidation } from 'providers/address-validation-provider';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';

import { cowApi } from './cow-api';
import { getCowDomain, COW_ORDER_TYPES, buildOrderMessage } from './cow-signing';
import type { CowQuoteResponse } from './types';

type UseCowOrderProps = {
  quote: CowQuoteResponse | undefined;
  receiver: Address | undefined;
};

export const useCowOrder = ({ quote, receiver }: UseCowOrderProps) => {
  const { data: walletClient } = useWalletClient();
  const { chainId } = useDappStatus();
  const { validateAddress } = useAddressValidation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderUid, setOrderUid] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const signAndSubmit = useCallback(async () => {
    if (!quote || !walletClient?.account?.address || !receiver) return;

    const isValid = await validateAddress(walletClient.account.address);
    if (!isValid) return;

    trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapStart);

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Build EIP-712 message from quote
      const message = buildOrderMessage(quote.quote, receiver);
      const domain = getCowDomain(chainId);

      // 2. Sign with wallet
      const signature = await walletClient.signTypedData({
        domain,
        types: COW_ORDER_TYPES,
        primaryType: 'Order',
        message,
      });

      // 3. Submit to CoW Protocol API
      const uid = await cowApi.submitOrder(chainId, {
        sellToken: quote.quote.sellToken,
        buyToken: quote.quote.buyToken,
        receiver,
        sellAmount: quote.quote.sellAmount,
        buyAmount: quote.quote.buyAmount,
        feeAmount: quote.quote.feeAmount,
        validTo: quote.quote.validTo,
        appData: quote.quote.appData,
        kind: quote.quote.kind,
        partiallyFillable: false,
        sellTokenBalance: 'erc20',
        buyTokenBalance: 'erc20',
        signingScheme: 'eip712',
        signature,
        from: walletClient.account.address,
      });

      setOrderUid(uid);
      trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapPosted);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsSubmitting(false);
    }
  }, [quote, walletClient, receiver, chainId, validateAddress]);

  const reset = useCallback(() => {
    setOrderUid(null);
    setError(null);
  }, []);

  return { signAndSubmit, isSubmitting, orderUid, error, reset };
};
