import { FC } from 'react';
import { Section } from 'shared/components';
import {
  WhatIsEarnUsd,
  WhatIsApyForEarnUsd,
  WhatFeesAreApplied,
  RisksOfDepositing,
  WhoIsCurator,
  HowDoesDepositWork,
  HowLongToDeposit,
  PendingRequestRewards,
  HowManyDepositRequests,
  CanICancelMyDeposit,
  CanICreateANewDepositRequest,
  WhatIsEarnUsdToken,
  WhatCanIDoWithEarnUsd,
  HowDoesWithdrawalWork,
  HowLongToWithdraw,
  WhyReceiveUsdcOnWithdrawal,
  IsThereAFee,
  PendingWithdrawalRewards,
  HowManyWithdrawalRequests,
  CanICancelMyWithdrawalRequest,
  HowDoIClaimMyRewards,
} from './list';

export const EarnUsdFaq: FC = () => {
  return (
    <Section title="FAQ" data-testid="vault-faq">
      <WhatIsEarnUsd />
      <WhatIsApyForEarnUsd />
      <WhatFeesAreApplied />
      <RisksOfDepositing />
      <WhoIsCurator />
      <HowDoesDepositWork />
      <HowLongToDeposit />
      <PendingRequestRewards />
      <HowManyDepositRequests />
      <CanICancelMyDeposit />
      <CanICreateANewDepositRequest />
      <WhatIsEarnUsdToken />
      <WhatCanIDoWithEarnUsd />
      <HowDoesWithdrawalWork />
      <HowLongToWithdraw />
      <WhyReceiveUsdcOnWithdrawal />
      <IsThereAFee />
      <PendingWithdrawalRewards />
      <HowManyWithdrawalRequests />
      <CanICancelMyWithdrawalRequest />
      <HowDoIClaimMyRewards />
    </Section>
  );
};
