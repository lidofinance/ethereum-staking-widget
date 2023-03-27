import { RequestDataProvider } from './providers/request-data-provider';
import RequestTxModalProvider from './providers/request-tx-modal-provider';
import { ClaimDataProvider } from './providers/claim-data-provider';
import ClaimTxModalProvider from './providers/claim-tx-modal-provider';
import { useWithdrawals } from './hooks';
import { RequestForm, RequestWallet } from './request';
import { ClaimForm, ClaimWallet } from './claim';
import { RequestFaq } from 'features/withdrawals/withdrawals-faq/request-faq';
import { ClaimFaq } from 'features/withdrawals/withdrawals-faq/claim-faq';

export const WithdrawalsTabs = () => {
  const { isClaimTab } = useWithdrawals();

  return (
    <ClaimDataProvider>
      <RequestDataProvider>
        {isClaimTab ? (
          <ClaimTxModalProvider>
            <ClaimWallet />
            <ClaimForm />
            <ClaimFaq />
          </ClaimTxModalProvider>
        ) : (
          <RequestTxModalProvider>
            <RequestWallet />
            <RequestForm />
            <RequestFaq />
          </RequestTxModalProvider>
        )}
      </RequestDataProvider>
    </ClaimDataProvider>
  );
};
