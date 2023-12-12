import { FC } from 'react';
import { Section } from 'shared/components';
import { useMatomoEventHandle } from 'shared/hooks';

import {
  WhatIsLido,
  HowDoesLidoWork,
  LidoEthApr,
  WhatIsSteth,
  HowCanIGetSteth,
  SafeWorkWithLido,
  HowCanIUseSteth,
  WhereCanICoverMySteth,
  RisksOfStakingWithLido,
  LidoFee,
  HowCanIUnstakeSteth,
} from './list';

export const StakeFaq: FC = () => {
  const onClickHandler = useMatomoEventHandle();

  return (
    <Section title="FAQ" onClick={onClickHandler}>
      <WhatIsLido />
      <HowDoesLidoWork />
      <SafeWorkWithLido />
      <RisksOfStakingWithLido />
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
