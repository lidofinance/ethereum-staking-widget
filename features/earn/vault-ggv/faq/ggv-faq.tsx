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
} from './list';

export const GGVFaq: FC = () => {
  return (
    <Section title="FAQ" data-testid="vault-faq">
      <WhatIsLidoGGV />
      <WhatIsApyForGGV />
      <DepositFee />
      <RisksOfDepositing />
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
