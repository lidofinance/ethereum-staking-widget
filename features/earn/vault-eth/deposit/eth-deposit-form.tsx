import { Block } from '@lidofinance/lido-ui';

import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultForm } from 'features/earn/shared/vault-form';
import {
  VaultTxInfo,
  VaultTxInfoRow,
} from 'features/earn/shared/vault-tx-info';
import { VaultWarning } from 'features/earn/shared/vault-warning';

import { ETHDepositFormProvider } from './form-context';
import { ETHDepositInputGroup } from './eth-deposit-input-group';
import { ETHWillReceive } from './eth-deposit-will-receive';
import { ETHDepositSubmitButton } from './eth-deposit-submit-button';
// import { ETHAvailableDeposit } from './eth-available-deposit';
// import { ETHDepositRequests } from './eth-deposit-requests';

export const ETHDepositForm = () => {
  return (
    <Block>
      <ETHDepositFormProvider>
        <VaultForm data-testid="deposit-form">
          <VaultFormSection>
            {/* <ETHDepositRequests /> */}
            {/* <ETHAvailableDeposit /> */}
            <ETHDepositInputGroup />
          </VaultFormSection>
          <VaultTxInfo>
            <ETHWillReceive />
            <VaultTxInfoRow
              title="Waiting time"
              help={
                <>
                  Deposits usually complete within 24 hours, often sooner. You
                  can track progress in the Deposit section of the Lido stRATEGY
                  UI.
                </>
              }
            >
              {'24 hours'}
            </VaultTxInfoRow>
          </VaultTxInfo>
          <VaultWarning variant="info">
            Withdrawals are only in wstETH, regardless of deposited asset(s).
          </VaultWarning>
          <ETHDepositSubmitButton />
        </VaultForm>
      </ETHDepositFormProvider>
    </Block>
  );
};
