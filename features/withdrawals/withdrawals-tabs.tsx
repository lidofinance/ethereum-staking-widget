import { Switch } from 'shared/components';
import { ClaimFaq } from 'features/withdrawals/withdrawals-faq/claim-faq';

import { TransactionModalProvider } from './contexts/transaction-modal-context';
import { ClaimDataProvider } from './contexts/claim-data-context';
import { useWithdrawals } from './contexts/withdrawals-context';

import { ClaimForm, ClaimWallet } from './claim';
import { TxClaimModal } from './claim/tx-modal/tx-claim-modal';

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

export const WithdrawalsTabs = () => {
  const { isClaimTab } = useWithdrawals();
  return (
    <ClaimDataProvider>
      <Switch checked={isClaimTab} routes={withdrawalRoutes} />
      {isClaimTab ? (
        <TransactionModalProvider>
          <ClaimWallet />
          <ClaimForm />
          <ClaimFaq />
          <TxClaimModal />
        </TransactionModalProvider>
      ) : (
        <Request />
      )}
    </ClaimDataProvider>
  );
};
