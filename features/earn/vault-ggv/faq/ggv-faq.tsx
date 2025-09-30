import { FC } from 'react';
import { Section } from 'shared/components';
import {
  WhatIsLidoGGV,
  WhatIsApyForGGV,
  WhatAreTheRisksOutlinedInTheVault,
  IsGGVAudited,
  DepositFee,
  WhatIsGGToken,
  WhatCanIDoWithGGToken,
  WhyDidINotSeeAnyRewards,
  HowLongShouldIStay,
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
    <Section title="FAQ" data-testid="vault-faq">
      <WhatIsLidoGGV />
      <WhatIsApyForGGV />
      <DepositFee />
      <WhatAreTheRisksOutlinedInTheVault />
      <IsGGVAudited />
      <WhoIsCurator />
      <WhatIsGGToken />
      <WhatCanIDoWithGGToken />
      <WhyDidINotSeeAnyRewards />
      <HowLongShouldIStay />
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
