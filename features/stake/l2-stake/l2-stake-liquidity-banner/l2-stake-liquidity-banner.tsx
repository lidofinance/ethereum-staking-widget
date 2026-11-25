import { parseEther } from 'viem';
import { useWatch } from 'react-hook-form';

import { useConfig } from 'config';
import type { CHAIN_ID } from 'config/chains';
import { getPrettyChainName, useDappStatus } from 'modules/web3';

import { L2StakeFormInputType } from '../types';
import { useFastStakeLiquidity } from '../hooks/use-fast-liquidity';
import { BannerHeader, BannerStyled, InfoIconStyled } from './styles';

export const L2StakeLiquidityBanner = () => {
  const inputAmount = useWatch<L2StakeFormInputType, 'amount'>({
    name: 'amount',
  });
  const { l2Stake } = useConfig().externalConfig;
  const { data: fastStakeLiquidityData } = useFastStakeLiquidity();

  const { chainId } = useDappStatus();
  const chainName = getPrettyChainName(chainId);
  const liquidityTargetEth = parseEther(
    String(l2Stake.perChain[chainId as CHAIN_ID].liquidityTarget),
  );

  if (!fastStakeLiquidityData || inputAmount == null) return null;

  const exceedsLiquidity = inputAmount > fastStakeLiquidityData.eth;
  const belowLiquidityTarget = inputAmount <= liquidityTargetEth;

  if (exceedsLiquidity && belowLiquidityTarget)
    return (
      <BannerStyled>
        <BannerHeader>
          <InfoIconStyled />
          This amount exceeds the remaining pool capacity on {chainName}
        </BannerHeader>
        There isn’t enough liquidity in the pool on {chainName} for this amount
        right now. You can wait ~1 hour for the pool to be refilled with wstETH.
      </BannerStyled>
    );

  return null;
};
