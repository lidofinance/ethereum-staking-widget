import { Switch } from 'shared/components';

import { WITHDRAWALS_CLAIM_PATH, WITHDRAWALS_REQUEST_PATH } from 'config/urls';

import { ClaimDataProvider } from './contexts/claim-data-context';
import { useWithdrawals } from './contexts/withdrawals-context';
import { Claim } from './claim';
import { Request } from './request';
import { GoerliSunsetBanner } from 'shared/banners/goerli-sunset';
import { OutdatedHashBanner } from 'features/ipfs/outdated-hash-banner';

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

export const WithdrawalsTabs = () => {
  const { isClaimTab } = useWithdrawals();
  return (
    <ClaimDataProvider>
      <Switch checked={isClaimTab} routes={withdrawalRoutes} />
      <OutdatedHashBanner />
      <GoerliSunsetBanner />
      {isClaimTab ? <Claim /> : <Request />}
    </ClaimDataProvider>
  );
};
