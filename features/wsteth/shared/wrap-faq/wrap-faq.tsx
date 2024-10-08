import { Section } from 'shared/components';
import { useMatomoEventHandle } from 'shared/hooks';
import { useDappStatus } from 'shared/hooks/use-dapp-status';
import { useDappChain, OPTIMISM } from 'providers/dapp-chain';

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
  const { chainName } = useDappChain();
  const { isWalletConnected } = useDappStatus();
  const onClickHandler = useMatomoEventHandle();

  if (isWalletConnected && chainName === OPTIMISM) {
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
