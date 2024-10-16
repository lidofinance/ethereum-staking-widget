import { Switch } from 'shared/components';

import { WITHDRAWALS_CLAIM_PATH, WITHDRAWALS_REQUEST_PATH } from 'consts/urls';

import { ClaimDataProvider } from './contexts/claim-data-context';
import { useWithdrawals } from './contexts/withdrawals-context';
import { Claim } from './claim';
import { Request } from './request';
import { SupportOnlyL1Chains } from 'modules/web3';

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
    <SupportOnlyL1Chains>
      <ClaimDataProvider>
        <Switch checked={isClaimTab} routes={withdrawalRoutes} />
        {isClaimTab ? <Claim /> : <Request />}
      </ClaimDataProvider>
    </SupportOnlyL1Chains>
  );
};
