import { FC } from 'react';
import { Section } from 'shared/components';
import { useMatomoEventHandle } from 'shared/hooks';

import {
  WhatIsLido,
  HowDoesLidoWork,
  LidoEthApr,
  WhatIsSteth,
  HowCanIGetSteth,
  WhatSecurityMeasures,
  HowCanIUseSteth,
  WhereCanICoverMySteth,
  RisksOfEngagingWithLido,
  LidoFee,
  HowCanIUnstakeSteth,
  HowDoesDirectStakingWork,
} from './list';

export const StakeFaq: FC = () => {
  const onClickHandler = useMatomoEventHandle();

  return (
    <Section title="FAQ" onClick={onClickHandler}>
      <WhatIsLido />
      <HowDoesLidoWork />
      <HowDoesDirectStakingWork />
      <WhatSecurityMeasures />
      <RisksOfEngagingWithLido />
      <LidoEthApr />
      <LidoFee />
      <WhatIsSteth />
      <HowCanIGetSteth />
      <HowCanIUseSteth />
      <WhereCanICoverMySteth />
      <HowCanIUnstakeSteth />
    </Section>
  );
};
