import { FAQItem } from '@lidofinance/ui-faq';

import { Switch } from 'shared/components';

import { ClaimDataProvider } from './contexts/claim-data-context';
import { useWithdrawals } from './contexts/withdrawals-context';
import { Claim } from './claim';
import { Request } from './request';

import {
  WITHDRAWAL_CLAIM_PATH,
  WITHDRAWAL_REQUEST_PATH,
} from 'features/withdrawals//withdrawals-constants';

const withdrawalRoutes = [
  {
    path: WITHDRAWAL_REQUEST_PATH,
    name: 'Request',
  },
  {
    path: WITHDRAWAL_CLAIM_PATH,
    name: 'Claim',
  },
];

type WithdrawalsTabsProps = {
  faqListRequest?: FAQItem[];
  faqListClaim?: FAQItem[];
};

export const WithdrawalsTabs = ({
  faqListRequest,
  faqListClaim,
}: WithdrawalsTabsProps) => {
  const { isClaimTab } = useWithdrawals();
  return (
    <ClaimDataProvider>
      <Switch checked={isClaimTab} routes={withdrawalRoutes} />
      {isClaimTab ? (
        <Claim faqList={faqListClaim} />
      ) : (
        <Request faqList={faqListRequest} />
      )}
    </ClaimDataProvider>
  );
};
