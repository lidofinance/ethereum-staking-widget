import { FC } from 'react';
import { Section } from 'shared/components';
import {
  WhatAreMellowPoints,
  WhatIsLidoStrategy,
  WhatFeesAreApplied,
  RisksOfDepositing,
  WhoIsCurator,
  HowDoesDepositWork,
  HowLongToDeposit,
  HowManyDepositRequests,
  CanICancelMyDeposit,
  CanICreateANewDepositRequest,
  WhatIsStrethToken,
  WhatCanIDoWithStreth,
  HowDoesWithdrawalWork,
  HowLongToWithdraw,
  WhyReceiveWstethOnWithdrawal,
  CanITransformWstethToEth,
  IsThereAFee,
  PendingRequestRewards,
  HowManyWithdrawalRequests,
  CanICancelMyWithdrawalRequest,
  HowDoIClaimMyRewards,
} from './list';

export const STGFaq: FC = () => {
  return (
    <Section title="FAQ" data-testid="vault-faq">
      <WhatIsLidoStrategy />
      <WhatAreMellowPoints />
      <WhatFeesAreApplied />
      <RisksOfDepositing />
      <WhoIsCurator />
      <HowDoesDepositWork />
      <HowLongToDeposit />
      <HowManyDepositRequests />
      <CanICancelMyDeposit />
      <CanICreateANewDepositRequest />
      <WhatIsStrethToken />
      <WhatCanIDoWithStreth />
      <HowDoesWithdrawalWork />
      <HowLongToWithdraw />
      <WhyReceiveWstethOnWithdrawal />
      <CanITransformWstethToEth />
      <IsThereAFee />
      <PendingRequestRewards />
      <HowManyWithdrawalRequests />
      <CanICancelMyWithdrawalRequest />
      <HowDoIClaimMyRewards />
    </Section>
  );
};
