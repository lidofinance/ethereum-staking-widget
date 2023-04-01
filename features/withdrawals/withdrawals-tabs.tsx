import { Switch } from 'shared/components';
import { RequestFaq } from 'features/withdrawals/withdrawals-faq/request-faq';
import { ClaimFaq } from 'features/withdrawals/withdrawals-faq/claim-faq';

import { RequestDataProvider } from './providers/request-data-provider';
import { TransactionModalProvider } from './contexts/transaction-modal-context';
import { ClaimDataProvider } from './contexts/claim-data-context';
import { useWithdrawals } from './hooks';
import { RequestForm, RequestWallet } from './request';
import { ClaimForm, ClaimWallet } from './claim';
import { TxRequestModal } from './request/tx-modal/tx-request-modal';
import { TxClaimModal } from './claim/tx-modal/tx-claim-modal';

export const WithdrawalsTabs = () => {
  const { navRoutes, isClaimTab } = useWithdrawals();
  return (
    <ClaimDataProvider>
      <Switch checked={isClaimTab} routes={navRoutes} />
      <RequestDataProvider>
        {/* We reuse provider but make sure these are different components for tabs */}
        <TransactionModalProvider
          key={isClaimTab ? 'CLAIM_PROVIDER' : 'REQeUST_PROVIDER'}
        >
          {isClaimTab ? (
            <>
              <ClaimWallet />
              <ClaimForm />
              <ClaimFaq />
              <TxClaimModal />
            </>
          ) : (
            <>
              <RequestWallet />
              <RequestForm />
              <RequestFaq />
              <TxRequestModal />
            </>
          )}
        </TransactionModalProvider>
      </RequestDataProvider>
    </ClaimDataProvider>
  );
};
