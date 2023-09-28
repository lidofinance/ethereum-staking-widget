import { Section } from 'shared/components';
import { useMatomoEventHandle } from 'shared/hooks';

import {
  WhatIsWsteth,
  HowCanIGetWsteth,
  HowCanIUseWsteth,
  DoIGetMyStakingRewards,
  DoINeedToClaimMyStakingRewards,
  HowCouldIUnwrapWstethToSteth,
  DoINeedToUnwrapMyWsteth,
} from './list';

export const WrapFaq = () => {
  const onClickHandler = useMatomoEventHandle();

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
