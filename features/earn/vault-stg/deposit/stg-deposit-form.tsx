import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultForm } from 'features/earn/shared/vault-form';
import { VaultTxInfo } from 'features/earn/shared/vault-tx-info';
import { TokenEthIcon32, TokenStrethIcon } from 'assets/earn';

import { STGDepositFormProvider } from './form-context';
import { STGDepositInputGroup } from './stg-deposit-input-group';
import { STGAvailableDeposit } from './stg-available-deposit';
import { STGWillReceive } from './stg-deposit-will-receive';
import { STGDepositSubmitButton } from './stg-deposit-submit-button';
import { VaultWarning } from 'features/earn/shared/vault-warning';
import { STGPendingAction } from '../stg-pending-action/stg-pending-action';

export const STGDepositForm = () => {
  return (
    <STGDepositFormProvider>
      <VaultForm data-testid="deposit-form">
        <VaultFormSection>
          <STGPendingAction
            title="Pending deposit request"
            tokenLogo={<TokenEthIcon32 />}
            tokenAmount="1,000"
            tokenName="ETH"
            tokenAmountUSD="$1,000"
            createdDate="18 Sep 2025"
            actionText="Cancel"
            actionCallback={() => void 0}
          />
          <br />
          <STGPendingAction
            title="Ready to claim"
            tokenLogo={<TokenStrethIcon />}
            tokenAmount="1,000"
            tokenName="strETH"
            tokenAmountUSD="$1,000"
            createdDate="18 Sep 2025"
            actionText="Claim"
            actionCallback={() => void 0}
          />
          <br />
          <STGAvailableDeposit />
          <STGDepositInputGroup />
        </VaultFormSection>
        <VaultTxInfo>
          <STGWillReceive />
        </VaultTxInfo>
        <VaultWarning variant="info">
          Withdrawing less than 3 days after deposit reduces rewards.
          Withdrawals are only in wstETH, regardless of deposited asset(s).
        </VaultWarning>
        <STGDepositSubmitButton />
      </VaultForm>
    </STGDepositFormProvider>
  );
};
