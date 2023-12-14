import { FC, memo } from 'react';
import { Block } from '@lidofinance/lido-ui';

import { StakeFormProvider } from './stake-form-context';
import { TransactionModalProvider } from 'shared/transaction-modal';

import { Wallet } from './wallet';
import { StakeAmountInput } from './controls/stake-amount-input';
import { StakeSubmitButton } from './controls/stake-submit-button';
import { StakeFormInfo } from './stake-form-info';
import { StakeFormModal } from './stake-form-modal';
import { FormControllerStyled } from './styles';

export const StakeForm: FC = memo(() => {
  return (
    <TransactionModalProvider>
      <StakeFormProvider>
        <Wallet />
        <Block data-testid="stakeForm">
          <FormControllerStyled>
            <StakeAmountInput />
            <StakeSubmitButton />
          </FormControllerStyled>
          <StakeFormInfo />
          <StakeFormModal />
        </Block>
      </StakeFormProvider>
    </TransactionModalProvider>
  );
});
