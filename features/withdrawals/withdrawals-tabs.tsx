import { PageFAQ } from '@lidofinance/ui-faq';

import { WITHDRAWALS_CLAIM_PATH, WITHDRAWALS_REQUEST_PATH } from 'config/urls';
import { GoerliSunsetBanner } from 'shared/banners/goerli-sunset';
import { Switch } from 'shared/components';

import { ClaimDataProvider } from './contexts/claim-data-context';
import { useWithdrawals } from './contexts/withdrawals-context';
import { Claim } from './claim';
import { Request } from './request';

const withdrawalRoutes = [
  {
    path: WITHDRAWALS_REQUEST_PATH,
    name: 'Request',
  },
  {
    path: WITHDRAWALS_CLAIM_PATH,
    name: 'Claim',
  },
];

type WithdrawalsTabsProps = {
  faq?: {
    pageRequestFAQ?: PageFAQ;
    pageClaimFAQ?: PageFAQ;
    eTag?: string | null;
  };
};

export const WithdrawalsTabs = ({ faq }: WithdrawalsTabsProps) => {
  const { isClaimTab } = useWithdrawals();
  return (
    <ClaimDataProvider>
      <Switch checked={isClaimTab} routes={withdrawalRoutes} />
      <GoerliSunsetBanner />
      {isClaimTab ? (
        <Claim
          faq={{
            pageFAQ: faq?.pageClaimFAQ,
            eTag: faq?.eTag,
          }}
        />
      ) : (
        <Request
          faq={{
            pageFAQ: faq?.pageRequestFAQ,
            eTag: faq?.eTag,
          }}
        />
      )}
    </ClaimDataProvider>
  );
};
