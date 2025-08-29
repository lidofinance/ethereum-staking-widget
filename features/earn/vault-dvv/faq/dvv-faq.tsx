import { FC } from 'react';
import { Section } from 'shared/components';
import { RisksOfStakingWithLido } from 'features/stake/stake-faq/list';
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
} from './list';

export const DVVFaq: FC = () => {
  return (
    <Section title="FAQ">
      <WhatIsLidoDVV />
      <WhatIsAprForDVV />
      <WhatAreMellowPoints />
      <DepositFee />
      <RisksOfDepositing />
      <RisksOfStakingWithLido />
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
