import { FC } from 'react';
import { Section } from 'shared/components';
import { FaqGroup } from 'features/earn/shared/v2/faq';
import { useInpageNavigation } from 'providers/inpage-navigation';
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

const FAQ_IDS = {
  apy: 'faq-apy',
  fees: 'faq-fees',
  risks: 'faq-risks',
  curator: 'faq-curator',
  depositWork: 'faq-deposit-work',
  depositTime: 'faq-deposit-time',
  pendingRewards: 'faq-pending-rewards',
  depositRequests: 'faq-deposit-requests',
  cancelDeposit: 'faq-cancel-deposit',
  newDeposit: 'faq-new-deposit-claim',
  token: 'faq-token',
  tokenUse: 'faq-token-use',
  withdrawalWork: 'faq-withdrawal-work',
  withdrawTime: 'faq-withdraw-time',
  wstethWithdrawal: 'faq-wsteth-withdrawal',
  fee: 'faq-fee',
  pendingWithdrawal: 'faq-pending-withdrawal',
  withdrawalRequests: 'faq-withdrawal-requests',
  cancelWithdrawal: 'faq-cancel-withdrawal',
  claimRewards: 'faq-claim-rewards',
} as const;

const FAQ_IDS_SET = new Set(Object.values(FAQ_IDS));

type FaqId = (typeof FAQ_IDS)[keyof typeof FAQ_IDS];

export const EarnEthFaq: FC = () => {
  const { hashNav } = useInpageNavigation();
  const activeItemHash = FAQ_IDS_SET.has(hashNav as FaqId) ? hashNav : '';

  return (
    <FaqGroup activeItemHash={activeItemHash}>
      <Section data-testid="vault-faq">
        <WhatIsEarnEth defaultExpanded />
        <WhatIsApyForEarnEth id={FAQ_IDS.apy} />
        <WhatFeesAreApplied id={FAQ_IDS.fees} />
        <RisksOfDepositing id={FAQ_IDS.risks} />
        <WhoIsCurator id={FAQ_IDS.curator} />
        <HowDoesDepositWork id={FAQ_IDS.depositWork} />
        <HowLongToDeposit id={FAQ_IDS.depositTime} />
        <PendingRequestRewards id={FAQ_IDS.pendingRewards} />
        <HowManyDepositRequests id={FAQ_IDS.depositRequests} />
        <CanICancelMyDeposit id={FAQ_IDS.cancelDeposit} />
        <CanICreateANewDepositRequest id={FAQ_IDS.newDeposit} />
        <WhatIsEarnEthToken id={FAQ_IDS.token} />
        <WhatCanIDoWithEarnEth id={FAQ_IDS.tokenUse} />
        <HowDoesWithdrawalWork id={FAQ_IDS.withdrawalWork} />
        <HowLongToWithdraw id={FAQ_IDS.withdrawTime} />
        <WhyReceiveWstethOnWithdrawal id={FAQ_IDS.wstethWithdrawal} />
        <IsThereAFee id={FAQ_IDS.fee} />
        <PendingWithdrawalRewards id={FAQ_IDS.pendingWithdrawal} />
        <HowManyWithdrawalRequests id={FAQ_IDS.withdrawalRequests} />
        <CanICancelMyWithdrawalRequest id={FAQ_IDS.cancelWithdrawal} />
        <HowDoIClaimMyRewards id={FAQ_IDS.claimRewards} />
      </Section>
    </FaqGroup>
  );
};
