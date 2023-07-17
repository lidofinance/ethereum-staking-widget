import { Switch } from 'shared/components';
import { RequestFaq } from 'features/withdrawals/withdrawals-faq/request-faq';
import { ClaimFaq } from 'features/withdrawals/withdrawals-faq/claim-faq';

import { RequestDataProvider } from './contexts/request-data-context';
import { RequestFormProvider } from './contexts/request-form-context';
import { TransactionModalProvider } from './contexts/transaction-modal-context';
import { ClaimDataProvider } from './contexts/claim-data-context';
import { useWithdrawals } from './contexts/withdrawals-context';
import { RequestForm, RequestWallet } from './request';
import { ClaimForm, ClaimWallet } from './claim';
import { TxRequestModal } from './request/tx-modal/tx-request-modal';
import { TxClaimModal } from './claim/tx-modal/tx-claim-modal';

import {
  WITHDRAWAL_CLAIM_PATH,
  WITHDRAWAL_REQUEST_PATH,
} from 'features/withdrawals//withdrawals-constants';

export const withdrawalRoutes = [
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
      {/* We reuse provider but make sure these are different components for tabs */}
      <TransactionModalProvider
        key={isClaimTab ? 'CLAIM_PROVIDER' : 'REQUEST_PROVIDER'}
      >
        {isClaimTab ? (
          <>
            <ClaimWallet />
            <ClaimForm />
            <ClaimFaq />
            <TxClaimModal />
          </>
        ) : (
          <RequestDataProvider>
            <RequestFormProvider>
              <RequestWallet />
              <RequestForm />
            </RequestFormProvider>
            <RequestFaq />
            <TxRequestModal />
          </RequestDataProvider>
        )}
      </TransactionModalProvider>
    </ClaimDataProvider>
  );
};
