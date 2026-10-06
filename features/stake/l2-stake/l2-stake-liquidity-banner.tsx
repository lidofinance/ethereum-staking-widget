import styled from 'styled-components';

import { getPrettyChainName, useDappStatus } from 'modules/web3';
import { useWatch } from 'react-hook-form';
import { L2StakeFormInputType } from './types';
import { useFastStakeLiquidity } from './hooks/use-fast-liquidity';
import { CHAINS, useConfig } from 'config';
import { parseEther } from 'viem';

const BannerStyled = styled.div`
  background-color: #f2f3f5;
  border-radius: ${(props) => props.theme.borderRadiusesMap.lg}px;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  padding: ${(props) => props.theme.spaceMap.md}px;

  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.fontSizesMap.xxs}px;
`;

const BannerHeader = styled.h4`
  margin: 0;
`;

export const L2StakeLiquidityBanner = () => {
  const inputAmount = useWatch<L2StakeFormInputType, 'amount'>({
    name: 'amount',
  });
  const { l2Stake } = useConfig().externalConfig;
  const { data: fastStakeLiquidityData } = useFastStakeLiquidity();

  const { chainId } = useDappStatus();
  const chainName = getPrettyChainName(chainId);
  const liquidityTargetEth = parseEther(
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    String(l2Stake.perChain[chainId as CHAINS].liquidityTarget),
  );

  if (!fastStakeLiquidityData || inputAmount == null) return null;

  const exceedsLiquidity = inputAmount > fastStakeLiquidityData.eth;
  const belowLiquidityTarget = inputAmount < liquidityTargetEth;

  if (exceedsLiquidity && belowLiquidityTarget)
    return (
      <BannerStyled>
        <BannerHeader>
          This amount exceeds the remaining pool capacity on {chainName}
        </BannerHeader>
        There isn’t enough liquidity in the pool on {chainName} for this amount
        right now. You can wait ~1 hour for the pool to be refilled with wstETH.
      </BannerStyled>
    );

  return null;
};
