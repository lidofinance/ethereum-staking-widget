import { FC } from 'react';
import { Section } from 'shared/components';
import { useMatomoEventHandle } from 'shared/hooks';

import {
  WhatIsWsteth,
  HowCanIGetWsteth,
  HowCanIUseWsteth,
  DoIGetMyStakingRewards,
  DoINeedToClaimMyStakingRewards,
  HowDoIUnwrapWstethToSteth,
} from './list';

export const WrapFaq: FC = () => {
  const onClickHandler = useMatomoEventHandle();

  return (
    <Section title="FAQ" onClick={onClickHandler}>
      <WhatIsWsteth />
      <HowCanIGetWsteth />
      <HowCanIUseWsteth />
      <DoIGetMyStakingRewards />
      <DoINeedToClaimMyStakingRewards />
      <HowDoIUnwrapWstethToSteth />
    </Section>
  );
};
