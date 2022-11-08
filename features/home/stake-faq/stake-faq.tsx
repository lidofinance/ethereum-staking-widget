import { FC } from 'react';
import { Section } from 'shared/components';

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
  return (
    <Section title="FAQ">
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
