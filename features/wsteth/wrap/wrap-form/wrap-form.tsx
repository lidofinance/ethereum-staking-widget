import { memo } from 'react';

import { WrapFormStats } from './wrap-stats';
import { WrapBlock } from '../../shared/styles';
import { WrapFormTxModal } from './wrap-form-tx-modal';
import { WrapFormProvider } from '../wrap-form-context/wrap-form-context';
import { FormControllerWrap } from '../wrap-form-controls/form-controller-wrap';
import { TokenSelectWrap } from '../wrap-form-controls/token-select-wrap';
import { TokenAmountInputWrap } from '../wrap-form-controls/token-amount-input-wrap';
import { SubmitButtonWrap } from '../wrap-form-controls/submit-button-wrap';

import { TransactionModalProvider } from 'shared/transaction-modal/transaction-modal-context';
import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';
import { L2Wsteth } from 'shared/banners/l2-wsteth';

export const WrapForm: React.FC = memo(() => {
  return (
    <TransactionModalProvider>
      <WrapFormProvider>
        <WrapBlock data-testid="wrapForm">
          <FormControllerWrap>
            <InputGroupHookForm errorField="amount">
              <TokenSelectWrap />
              <TokenAmountInputWrap />
            </InputGroupHookForm>
            <SubmitButtonWrap />
          </FormControllerWrap>
          <L2Wsteth />
          <WrapFormStats />
          <WrapFormTxModal />
        </WrapBlock>
      </WrapFormProvider>
    </TransactionModalProvider>
  );
});
