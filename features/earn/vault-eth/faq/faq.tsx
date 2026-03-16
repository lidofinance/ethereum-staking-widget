import { FC } from 'react';
import { Section } from 'shared/components';
import {
  WhatIsEarnEth,
  WhatIsApyForEarnEth,
  WhatFeesAreApplied,
  RisksOfDepositing,
  WhoIsCurator,
  HowDoesDepositWork,
  HowLongToDeposit,
  PendingRequestRewards,
  HowManyDepositRequests,
  CanICancelMyDeposit,
  CanICreateANewDepositRequest,
  WhatIsEarnEthToken,
  WhatCanIDoWithEarnEth,
  HowDoesWithdrawalWork,
  HowLongToWithdraw,
  WhyReceiveWstethOnWithdrawal,
  IsThereAFee,
  PendingWithdrawalRewards,
  HowManyWithdrawalRequests,
  CanICancelMyWithdrawalRequest,
  HowDoIClaimMyRewards,
} from './list';

export const EarnEthFaq: FC = () => {
  return (
    <Section data-testid="vault-faq">
      <WhatIsEarnEth />
      <WhatIsApyForEarnEth />
      <WhatFeesAreApplied />
      <RisksOfDepositing />
      <WhoIsCurator />
      <HowDoesDepositWork />
      <HowLongToDeposit />
      <PendingRequestRewards />
      <HowManyDepositRequests />
      <CanICancelMyDeposit />
      <CanICreateANewDepositRequest />
      <WhatIsEarnEthToken />
      <WhatCanIDoWithEarnEth />
      <HowDoesWithdrawalWork />
      <HowLongToWithdraw />
      <WhyReceiveWstethOnWithdrawal />
      <IsThereAFee />
      <PendingWithdrawalRewards />
      <HowManyWithdrawalRequests />
      <CanICancelMyWithdrawalRequest />
      <HowDoIClaimMyRewards />
    </Section>
  );
};
