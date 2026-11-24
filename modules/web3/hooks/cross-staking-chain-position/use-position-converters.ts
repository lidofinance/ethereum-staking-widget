import { useMemo } from 'react';
import { WstethABI } from '@lidofinance/lido-ethereum-sdk/wrap';
import { useReadContract } from 'wagmi';

import { config } from 'config';
import { getTokenAddress } from 'config/networks/token-address';
import { TOKENS } from 'consts/tokens';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { bnAmountToNumber } from 'utils/bn';

import { convertToEth, type PositionToken } from './conversion';

const ETH_DECIMALS = 18n;

export type ConverterStatus = {
  isLoading: boolean;
  error: Error | null;
};

export type PositionConverters = {
  toEth: (
    token: PositionToken,
    amount: bigint,
    chainId: number,
  ) => bigint | undefined;
  ethToUsd: (ethAmount: bigint) => number | undefined;
  // per source, so a caller can wait on (and fail with) only what it uses
  status: {
    // token -> ETH rates
    eth: ConverterStatus;
    // ETH -> USD price
    usd: ConverterStatus;
  };
};

/**
 * Runs the price queries once per position (ETH/USD feed on mainnet,
 * wstETH rate on the default chain) and turns them into converters.
 * A failed query only leaves the values that depend on it undefined.
 */
export const usePositionConverters = (): PositionConverters => {
  const ethUsd = useEthUsd();

  const wstethRate = useReadContract({
    chainId: config.defaultChain,
    address: getTokenAddress(config.defaultChain, TOKENS.wsteth),
    abi: WstethABI,
    functionName: 'stEthPerToken',
    query: STRATEGY_CONSTANT,
  });

  const stethPerWsteth = wstethRate.data;
  const price = ethUsd.price;

  const isEthLoading = wstethRate.isLoading;
  const ethError = wstethRate.error;
  const isUsdLoading = ethUsd.isLoading;
  const usdError = ethUsd.error;

  return useMemo(
    () => ({
      toEth: (token, amount, chainId) =>
        convertToEth(token, amount, { stethPerWsteth }, chainId),
      ethToUsd: (ethAmount) =>
        ethAmount === 0n
          ? 0
          : price
            ? bnAmountToNumber(
                ethAmount * price.latestAnswer,
                Number(price.decimals + ETH_DECIMALS),
              )
            : undefined,
      status: {
        eth: { isLoading: isEthLoading, error: ethError },
        usd: { isLoading: isUsdLoading, error: usdError },
      },
    }),
    [stethPerWsteth, price, isEthLoading, ethError, isUsdLoading, usdError],
  );
};
