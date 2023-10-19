import { FC, memo } from 'react';
import { Block } from '@lidofinance/lido-ui';
import { L2Swap } from 'shared/banners';

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
        <Block>
          <FormControllerStyled>
            <StakeAmountInput />
            <StakeSubmitButton />
            <L2Swap />
          </FormControllerStyled>
          <StakeFormInfo />
          <StakeFormModal />
        </Block>
      </StakeFormProvider>
    </TransactionModalProvider>
  );
});
