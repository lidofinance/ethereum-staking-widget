import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';
import { config } from 'config';
import { TOKENS, getTokenAddress } from 'config/networks/token-address';
import { standardFetcher } from './standardFetcher';
import {
  calculateRateReceive,
  RateCalculationResult,
} from './calculate-rate-to-receive';

type JumperGetQuotePartial = {
  estimate: {
    toAmount: string;
    fromAmount: string;
  };
};

export const getJumperRate = async (
  amount: bigint,
  fromToken: TOKENS,
  toToken: TOKENS,
): Promise<RateCalculationResult> => {
  const basePath = 'https://li.quest/v1/quote';
  const params = new URLSearchParams({
    fromChain: CHAINS.Mainnet.toString(),
    toChain: CHAINS.Mainnet.toString(),
    fromToken: getTokenAddress(CHAINS.Mainnet, fromToken) as string,
    toToken: getTokenAddress(CHAINS.Mainnet, toToken) as string,
    fromAmount: amount.toString(),
    fromAddress: config.ESTIMATE_ACCOUNT,
  });

  const data = await standardFetcher<JumperGetQuotePartial>(
    `${basePath}?${params.toString()}`,
  );
  const fromAmount = BigInt(data?.estimate?.fromAmount);
  const toAmount = BigInt(data?.estimate?.toAmount);

  return calculateRateReceive(amount, fromAmount, toAmount);
};
