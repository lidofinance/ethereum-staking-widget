import { FC } from 'react';
import { Section } from 'shared/components';
import {
  WhatIsLidoDVV,
  WhatIsAprForDVV,
  WhatAreMellowPoints,
  RisksOfDepositing,
  DepositFee,
  WhatIsDVstETH,
  WhatCanIDoWithDVstETH,
  HowDoesWithdrawalWork,
  WhyOnlyWstethOnWithdrawal,
  CanITransformWstethToEth,
  IsThereAFeeForWithdrawal,
  HowDoIClaimRewards,
  WhoIsCurator,
} from './list';

export const DVVFaq: FC = () => {
  return (
    <Section title="FAQ">
      <WhatIsLidoDVV />
      <WhatIsAprForDVV />
      <WhatAreMellowPoints />
      <DepositFee />
      <RisksOfDepositing />
      <WhoIsCurator />
      <WhatIsDVstETH />
      <WhatCanIDoWithDVstETH />
      <HowDoesWithdrawalWork />
      <WhyOnlyWstethOnWithdrawal />
      <CanITransformWstethToEth />
      <IsThereAFeeForWithdrawal />
      <HowDoIClaimRewards />
    </Section>
  );
};
