import { RequestDataProvider } from './providers/request-data-provider';
import RequestTxModalProvider from './providers/request-tx-modal-provider';
import { ClaimDataProvider } from './providers/claim-data-provider';
import ClaimTxModalProvider from './providers/claim-tx-modal-provider';
import { useWithdrawals } from './hooks';
import { RequestForm, RequestWallet } from './request';
import { ClaimForm, ClaimWallet } from './claim';

export const WithdrawalsTabs = () => {
  const { isClaimTab } = useWithdrawals();

  return (
    <ClaimDataProvider>
      <RequestDataProvider>
        {isClaimTab ? (
          <ClaimTxModalProvider>
            <ClaimWallet />
            <ClaimForm />
          </ClaimTxModalProvider>
        ) : (
          <RequestTxModalProvider>
            <RequestWallet />
            <RequestForm />
          </RequestTxModalProvider>
        )}
      </RequestDataProvider>
    </ClaimDataProvider>
  );
};
