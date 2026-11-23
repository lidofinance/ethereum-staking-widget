import { useMemo } from 'react';
import type { Address } from 'viem';

import { CHAINS } from 'consts/chains';
import { TOKENS, type Token } from 'consts/tokens';
import { useLidoApr } from 'shared/hooks/useLidoApr';
import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import { useEthVaultApy } from 'features/earn/vault-eth/hooks/use-vault-apy';
import { useUsdVaultApy } from 'features/earn/vault-usd/hooks/use-vault-apy';
import {
  TOKEN_NAMES,
  getMainnetAddress,
  isLidoApiToken,
  mergeRows,
  toOnChainRow,
  tokenToRow,
  withRewards,
  type OnChainPosition,
  type RewardsByAddress,
} from '../utils';
import { useMainnetEarnPositions } from './use-mainnet-earn-positions';
import { useMainnetTokenBalances } from './use-mainnet-token-balances';
import { usePortfolioPositions } from './use-portfolio-positions';
import { usePortfolioRewards } from './use-portfolio-rewards';

export const useLidoPositions = (address?: Address) => {
  const balancesQuery = useMainnetTokenBalances(address);
  const earnPositions = useMainnetEarnPositions(address);
  const stethBalance = balancesQuery.data?.steth;
  const wstethBalance = balancesQuery.data?.wsteth;

  // stETH is valued 1:1 to ETH, as across the app
  const stethUsd = useEthUsd(stethBalance);
  const wstethUsd = useWstethUsd(wstethBalance, CHAINS.Mainnet);

  const { apr: lidoApr } = useLidoApr();
  const { apy: earnEthApy } = useEthVaultApy();
  const { apy: earnUsdApy } = useUsdVaultApy();

  const positionsQuery = usePortfolioPositions(address);
  const rewardsQuery = usePortfolioRewards(address);

  const rows = useMemo(() => {
    const rewardsByAddress: RewardsByAddress = new Map(
      (rewardsQuery.data?.rewards ?? []).map((tokenRewards) => [
        tokenRewards.address,
        tokenRewards,
      ]),
    );
    const stakingApr = lidoApr ? Number(lidoApr) : undefined;
    const aprByToken: Partial<Record<Token, number | undefined>> = {
      [TOKENS.steth]: stakingApr,
      [TOKENS.wsteth]: stakingApr,
      [TOKENS.earneth]: earnEthApy,
      [TOKENS.earnusd]: earnUsdApy,
    };

    const onChainPositions: OnChainPosition[] = [
      {
        token: TOKENS.steth,
        amount: stethBalance,
        valueUsd: stethUsd.usdAmount,
        apr: stakingApr,
      },
      {
        token: TOKENS.wsteth,
        amount: wstethBalance,
        valueUsd: wstethUsd.usdAmount,
        apr: stakingApr,
      },
      {
        token: TOKENS.earneth,
        amount: earnPositions.earneth,
        valueUsd: earnPositions.earnethUsd,
        apr: earnEthApy,
      },
      {
        token: TOKENS.earnusd,
        amount: earnPositions.earnusd,
        valueUsd: earnPositions.earnusdUsd,
        apr: earnUsdApy,
      },
    ];
    // until a balance is read on-chain, the API row stands in for it
    const addressesReadOnChain = new Set(
      onChainPositions
        .filter(({ amount }) => amount !== undefined)
        .map(({ token }) => getMainnetAddress(token)),
    );

    const onChainRows = onChainPositions
      .filter(({ amount }) => !!amount)
      .map((position) => toOnChainRow(position, rewardsByAddress));

    const apiRows = (positionsQuery.data?.tokens ?? [])
      .filter(
        (token) =>
          isLidoApiToken(token) &&
          token.amount > 0 &&
          // Ethereum rows already read on-chain
          !(
            token.chainId === CHAINS.Mainnet &&
            addressesReadOnChain.has(token.address ?? '')
          ),
      )
      .map((token) => {
        const row = tokenToRow(token);
        const knownToken = row.iconToken;
        // API rows of known Lido tokens look like the on-chain ones
        return withRewards(
          {
            ...row,
            name: (knownToken && TOKEN_NAMES[knownToken]) || row.name,
            apr: (knownToken && aprByToken[knownToken]) ?? null,
          },
          rewardsByAddress.get(token.address ?? ''),
        );
      });

    // wstETH on Ethereum and on L2s is one row, as in the design
    return mergeRows([...onChainRows, ...apiRows]);
  }, [
    stethBalance,
    wstethBalance,
    stethUsd.usdAmount,
    wstethUsd.usdAmount,
    earnPositions.earneth,
    earnPositions.earnusd,
    earnPositions.earnethUsd,
    earnPositions.earnusdUsd,
    lidoApr,
    earnEthApy,
    earnUsdApy,
    positionsQuery.data,
    rewardsQuery.data,
  ]);

  // held balances wait for their USD price, so no row shows N/A
  const isPriceLoading =
    (!!stethBalance && stethUsd.isLoading) ||
    (!!wstethBalance && wstethUsd.isLoading) ||
    earnPositions.isPriceLoading;

  // L2 and API-only rows: an empty table waits for the API too
  // a retry after a failure does not bring the skeletons back
  const isApiPending =
    rows.length === 0 &&
    positionsQuery.isLoading &&
    positionsQuery.errorUpdateCount === 0;

  const isLoading =
    balancesQuery.isLoading ||
    earnPositions.isLoading ||
    isPriceLoading ||
    isApiPending;
  // an unpriced row counts as 0 in the totals
  const isPriceMissing = !isLoading && rows.some((row) => row.valueUsd == null);

  return {
    rows,
    isLoading,
    isError:
      balancesQuery.isError ||
      earnPositions.isError ||
      positionsQuery.isError ||
      isPriceMissing,
    isRewardsLoading: rewardsQuery.isLoading,
    isRewardsError: rewardsQuery.isError,
    isRewardsStale: !!rewardsQuery.data?.stale,
    rewardsUpdatedAt: rewardsQuery.data?.updatedAt,
  };
};
