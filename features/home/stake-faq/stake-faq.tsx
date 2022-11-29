import { FC } from 'react';
import { Section } from 'shared/components';
import { useMatomoEventHandle } from 'shared/hooks';

import {
  WhatIsLido,
  HowDoesLidoWork,
  WhatIsLiquidStaking,
  WhatIsSteth,
  WhatIsLdo,
  SafeWorkWithLido,
  WhatIsInsuranceFundFor,
  WhereCanICoveMySteth,
  SelfStakingVsLiquidStaking,
  RisksOfStakingWithLido,
  LidoFee,
  StethCanBeConvertedToEth,
} from './list';

export const StakeFaq: FC = () => {
  const onClickHandler = useMatomoEventHandle();

  return (
    <Section title="FAQ" onClick={onClickHandler}>
      <WhatIsLido />
      <HowDoesLidoWork />
      <WhatIsLiquidStaking />
      <WhatIsSteth />
      <WhatIsLdo />
      <SafeWorkWithLido />
      <WhatIsInsuranceFundFor />
      <WhereCanICoveMySteth />
      <SelfStakingVsLiquidStaking />
      <RisksOfStakingWithLido />
      <LidoFee />
      <StethCanBeConvertedToEth />
    </Section>
  );
};
