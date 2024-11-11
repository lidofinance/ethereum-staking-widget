import { Section } from 'shared/components';
import { useMatomoEventHandle } from 'shared/hooks';
import { useDappStatus, DAPP_CHAIN_TYPE } from 'modules/web3';

import {
  WhatIsWsteth,
  HowCanIGetWsteth,
  HowCanIUseWsteth,
  DoIGetMyStakingRewards,
  DoINeedToClaimMyStakingRewards,
  HowCouldIUnwrapWstethToSteth,
  DoINeedToUnwrapMyWsteth,
} from './list';

import {
  WhatIsWstethOnOptimism,
  HowCanIGetWstethOnOptimism,
  HowCanIUseWstethOnOptimism,
  CanIStakeMyETHDirectlyOnOptimism,
  DoIStillGetStakingRewardsWithStETHOrWstETHOnOptimism,
  DoINeedToClaimMyStakingRewardsIfIWrapStETHToWstETHOnOptimism,
  HowCouldIUnwrapWstETHBackToStETHOnOptimism,
  WhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromOptimism,
} from './optimism-list';

export const WrapFaq = () => {
  const { isWalletConnected, chainType } = useDappStatus();
  const onClickHandler = useMatomoEventHandle();

  if (isWalletConnected && chainType === DAPP_CHAIN_TYPE.Optimism) {
    return (
      <Section title="FAQ" onClick={onClickHandler}>
        <WhatIsWstethOnOptimism />
        <HowCanIGetWstethOnOptimism />
        <HowCanIUseWstethOnOptimism />
        <CanIStakeMyETHDirectlyOnOptimism />
        <DoIStillGetStakingRewardsWithStETHOrWstETHOnOptimism />
        <DoINeedToClaimMyStakingRewardsIfIWrapStETHToWstETHOnOptimism />
        <HowCouldIUnwrapWstETHBackToStETHOnOptimism />
        <WhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromOptimism />
      </Section>
    );
  }

  return (
    <Section title="FAQ" onClick={onClickHandler}>
      <WhatIsWsteth />
      <HowCanIGetWsteth />
      <HowCanIUseWsteth />
      <DoIGetMyStakingRewards />
      <DoINeedToClaimMyStakingRewards />
      <HowCouldIUnwrapWstethToSteth />
      <DoINeedToUnwrapMyWsteth />
    </Section>
  );
};
