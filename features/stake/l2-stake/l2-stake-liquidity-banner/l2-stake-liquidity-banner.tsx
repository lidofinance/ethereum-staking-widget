import { useWatch } from 'react-hook-form';

import { getPrettyChainName, useDappStatus } from 'modules/web3';

import { L2StakeFormInputType } from '../types';
import { useFastStakeLiquidity } from '../fast-lane/use-fast-liquidity';
import { BannerHeader, BannerStyled, InfoIconStyled } from './styles';
import { useL2StakeState } from '../hooks/use-l2-stake-state';
import { useL2StakeFormData } from '../l2-stake-form-context';

type BannerProps = {
  title: React.ReactNode;
  message: React.ReactNode;
};

const Banner = ({ title, message }: BannerProps) => (
  <BannerStyled>
    <BannerHeader>
      <InfoIconStyled />
      {title}
    </BannerHeader>
    <p>{message}</p>
  </BannerStyled>
);

export const L2StakeLiquidityBanner = () => {
  const inputAmount = useWatch<L2StakeFormInputType, 'amount'>({
    name: 'amount',
  });
  const { liquidityTargetEth, fastLane, slowLane } = useL2StakeState();
  const { isSlowLane } = useL2StakeFormData();
  const { data: fastStakeLiquidityData } = useFastStakeLiquidity();
  const { chainId } = useDappStatus();
  const chainName = getPrettyChainName(chainId);

  const isSlowLaneRunning = isSlowLane && slowLane.isAvailable;

  //!NB: some conditions are excessive but left so for readability and robustness
  // When we have fast lane, we must inform user
  if (
    fastLane.isAvailable &&
    fastStakeLiquidityData &&
    inputAmount !== null &&
    liquidityTargetEth !== undefined
  ) {
    const exceedsFastLaneLiquidity = inputAmount > fastStakeLiquidityData.eth;
    const belowFastLaneLiquidityTarget = inputAmount <= liquidityTargetEth;

    const isAmountFillableButNotNow =
      exceedsFastLaneLiquidity && belowFastLaneLiquidityTarget;

    // we can launch the shuttle but maybe they can wait for refil
    if (isSlowLaneRunning && isAmountFillableButNotNow) {
      return (
        <Banner
          title={`This amount exceeds the remaining pool capacity on ${chainName}`}
          message={`There isn’t enough liquidity in the pool on ${chainName} for this amount right now. You can wait ~1 hour for the pool to be refilled with wstETH, or continue now with a dedicated Staking Shuttle, which takes about 1.5 hours.`}
        />
      );
    }

    // no slowLane so, just wait for the pool to be refilled
    if (!isSlowLaneRunning && isAmountFillableButNotNow) {
      return (
        <Banner
          title={`This amount exceeds the remaining pool capacity on ${chainName}`}
          message={`There isn’t enough liquidity in the pool on ${chainName} for this amount right now. You can wait ~1 hour for the pool to be refilled with wstETH.`}
        />
      );
    }
  }

  // Otherwise, if slow lane just inform the user about the Staking Shuttle timings
  if (isSlowLaneRunning) {
    return (
      <Banner
        title={`The Staking Shuttle will be launched upon your request`}
        message={`This amount will be processed through a dedicated “${chainName} <> Mainnet” Staking Shuttle launched for your stake. The process usually takes about 1.5 hours and completes the full Bridge → Stake → Bridge flow.`}
      />
    );
  }

  return null;
};
