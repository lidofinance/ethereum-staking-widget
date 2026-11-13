import { FC } from 'react';
import { Section } from 'shared/components';
import {
  WhatIsLidoGGV,
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
import { useGGVBulkWithdrawEnabled } from '../hooks/use-ggv-bulk-withdraw-enabled';

export const GGVFaq: FC = () => {
  const isBulkWithdraw = useGGVBulkWithdrawEnabled();

  return (
    <Section title="FAQ" data-testid="vault-faq">
      <WhatIsLidoGGV />
      <DepositFee />
      <WhatAreTheRisksOutlinedInTheVault />
      <IsGGVAudited />
      <WhoIsCurator />
      <WhatIsGGToken />
      <WhatCanIDoWithGGToken />
      <WhyDidINotSeeAnyRewards />
      <HowLongShouldIStay />
      <HowDoesWithdrawalWork isBulkWithdraw={isBulkWithdraw} />
      <HowLongToWithdraw isBulkWithdraw={isBulkWithdraw} />
      {/* Bulk withdraw pays out WETH at once and makes no new requests */}
      {!isBulkWithdraw && <WhyOnlyWstethOnWithdrawal />}
      {!isBulkWithdraw && <CanITransformWstethToEth />}
      <IsThereAFeeForWithdrawal />
      {!isBulkWithdraw && <PendingRequestRewards />}
      {!isBulkWithdraw && <HowManyWithdrawalRequests />}
      <CanICancelWithdrawalRequest />
      <HowDoIClaimRewards />
    </Section>
  );
};
