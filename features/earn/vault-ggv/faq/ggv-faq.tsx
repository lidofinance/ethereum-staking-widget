import { FC } from 'react';
import { Section } from 'shared/components';
import {
  WhatIsLidoGGV,
  WhatIsApyForGGV,
  RisksOfDepositing,
  DepositFee,
  WhatIsGGToken,
  WhatCanIDoWithGGToken,
  HowDoesWithdrawalWork,
  HowLongToWithdraw,
  WhyOnlyWstethOnWithdrawal,
  CanITransformWstethToEth,
  IsThereAFeeForWithdrawal,
  PendingRequestRewards,
  HowManyWithdrawalRequests,
  CanICancelWithdrawalRequest,
  HowDoIClaimRewards,
  WhoIsCurator,
} from './list';

export const GGVFaq: FC = () => {
  return (
    <Section title="FAQ">
      <WhatIsLidoGGV />
      <WhatIsApyForGGV />
      <DepositFee />
      <RisksOfDepositing />
      <WhoIsCurator />
      <WhatIsGGToken />
      <WhatCanIDoWithGGToken />
      <HowDoesWithdrawalWork />
      <HowLongToWithdraw />
      <WhyOnlyWstethOnWithdrawal />
      <CanITransformWstethToEth />
      <IsThereAFeeForWithdrawal />
      <PendingRequestRewards />
      <HowManyWithdrawalRequests />
      <CanICancelWithdrawalRequest />
      <HowDoIClaimRewards />
    </Section>
  );
};
