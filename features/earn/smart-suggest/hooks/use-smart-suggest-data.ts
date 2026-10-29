import { useMemo } from 'react';

import {
  ONE_wstETH,
  useEthereumBalance,
  useStablecoinBalance,
  useStETHByWstETH,
  useStethBalance,
  useWethBalance,
  useWstethBalance,
} from 'modules/web3';
import { TOKENS } from 'consts/tokens';
import { useEthUsd } from 'shared/hooks/use-eth-usd';

import { useEthVaultApy } from '../../vault-eth/hooks/use-vault-apy';
import { useEthVaultAvailable } from '../../vault-eth/hooks/use-vault-available';
import { useUsdVaultApy } from '../../vault-usd/hooks/use-vault-apy';
import { useUsdVaultAvailable } from '../../vault-usd/hooks/use-vault-available';
import {
  calculateSuggestions,
  type SmartSuggestResult,
} from '../utils/calculate-suggestions';

export type SmartSuggestData = SmartSuggestResult & {
  isReady: boolean;
};

export const useSmartSuggestData = (): SmartSuggestData => {
  const ethBalance = useEthereumBalance();
  const wethBalance = useWethBalance();
  const stethBalance = useStethBalance();
  const wstethBalance = useWstethBalance();
  const usdcBalance = useStablecoinBalance({ token: TOKENS.usdc });
  const usdtBalance = useStablecoinBalance({ token: TOKENS.usdt });
  const usdeBalance = useStablecoinBalance({ token: TOKENS.usde });

  const ethUsd = useEthUsd();
  const stethPerWsteth = useStETHByWstETH(ONE_wstETH);

  const ethApy = useEthVaultApy();
  const usdApy = useUsdVaultApy();
  const { isDepositEnabled: isEthDepositEnabled } = useEthVaultAvailable();
  const { isDepositEnabled: isUsdDepositEnabled } = useUsdVaultAvailable();

  // Wait only for the vaults that accept deposits.
  // Disabled queries never load, so they do not delay the result.
  const isEthVaultLoading =
    isEthDepositEnabled &&
    (ethApy.isLoading ||
      ethUsd.isLoading ||
      stethPerWsteth.isLoading ||
      ethBalance.isLoading ||
      wethBalance.isLoading ||
      stethBalance.isLoading ||
      wstethBalance.isLoading);

  const isUsdVaultLoading =
    isUsdDepositEnabled &&
    (usdApy.isLoading ||
      usdcBalance.isLoading ||
      usdtBalance.isLoading ||
      usdeBalance.isLoading);

  const result = useMemo(
    () =>
      calculateSuggestions({
        balances: {
          [TOKENS.eth]: ethBalance.data,
          [TOKENS.weth]: wethBalance.data,
          [TOKENS.steth]: stethBalance.data,
          [TOKENS.wsteth]: wstethBalance.data,
          [TOKENS.usdc]: usdcBalance.data,
          [TOKENS.usdt]: usdtBalance.data,
          [TOKENS.usde]: usdeBalance.data,
        },
        ethUsdPrice: ethUsd.price,
        stethPerWsteth: stethPerWsteth.data,
        vaults: {
          eth: { apy: ethApy.apy, isDepositEnabled: isEthDepositEnabled },
          usd: { apy: usdApy.apy, isDepositEnabled: isUsdDepositEnabled },
        },
      }),
    [
      ethBalance.data,
      wethBalance.data,
      stethBalance.data,
      wstethBalance.data,
      usdcBalance.data,
      usdtBalance.data,
      usdeBalance.data,
      ethUsd.price,
      stethPerWsteth.data,
      ethApy.apy,
      usdApy.apy,
      isEthDepositEnabled,
      isUsdDepositEnabled,
    ],
  );

  return {
    ...result,
    isReady: !isEthVaultLoading && !isUsdVaultLoading,
  };
};
