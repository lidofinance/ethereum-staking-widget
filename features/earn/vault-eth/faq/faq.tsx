import { FC } from 'react';
import { FAQ_LOSS_PROTECTION_ID, FaqGroup } from 'features/earn/shared/faq';
import { useInpageNavigation } from 'providers/inpage-navigation';
import {
  WhatIsEarnEth,
  WhatIsApyForEarnEth,
  WhatFeesAreApplied,
  RisksOfDepositing,
  WhoIsCurator,
  HowDoesDepositWork,
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
  HowAreDepositsProtected,
} from './list';

export const FAQ_IDS = {
  apy: 'faq-apy',
  fees: 'faq-fees',
  risks: 'faq-risks',
  curator: 'faq-curator',
  depositWork: 'faq-deposit-work',
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
  lossProtection: FAQ_LOSS_PROTECTION_ID,
} as const;

const FAQ_IDS_SET = new Set(Object.values(FAQ_IDS));

type FaqId = (typeof FAQ_IDS)[keyof typeof FAQ_IDS];

export const EarnEthFaq: FC = () => {
  const { hashNav } = useInpageNavigation();
  const activeItemHash = FAQ_IDS_SET.has(hashNav as FaqId) ? hashNav : '';

  return (
    <FaqGroup activeItemHash={activeItemHash}>
      <div data-testid="vault-faq">
        <WhatIsEarnEth defaultExpanded />
        <WhatIsApyForEarnEth id={FAQ_IDS.apy} />
        <WhatFeesAreApplied id={FAQ_IDS.fees} />
        <RisksOfDepositing id={FAQ_IDS.risks} />
        <WhoIsCurator id={FAQ_IDS.curator} />
        <HowDoesDepositWork id={FAQ_IDS.depositWork} />
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
        <HowAreDepositsProtected id={FAQ_IDS.lossProtection} />
      </div>
    </FaqGroup>
  );
};
