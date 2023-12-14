import { memo, FC } from 'react';

import { L2Wsteth } from 'shared/banners/l2-wsteth';
import { InputWrap, WrapBlock } from 'features/wsteth/shared/styles';

import { UnwrapStats } from './unwrap-stats';
import { UnwrapFormTxModal } from './unwrap-form-tx-modal';
import { TransactionModalProvider } from 'shared/transaction-modal';
import { UnwrapFormProvider } from '../unwrap-form-context';
import { FormController } from 'shared/hook-form/form-controller/form-controller';
import { TokenAmountInputUnwrap } from '../unwrap-form-controls/amount-input-unwrap';
import { SubmitButtonUnwrap } from '../unwrap-form-controls/submit-button-unwrap';

export const UnwrapForm: FC = memo(() => {
  return (
    <TransactionModalProvider>
      <UnwrapFormProvider>
        <WrapBlock data-testid="unwrapForm">
          <FormController>
            <InputWrap>
              <TokenAmountInputUnwrap />
            </InputWrap>
            <SubmitButtonUnwrap />
          </FormController>
          <L2Wsteth />
          <UnwrapStats />
          <UnwrapFormTxModal />
        </WrapBlock>
      </UnwrapFormProvider>
    </TransactionModalProvider>
  );
});
