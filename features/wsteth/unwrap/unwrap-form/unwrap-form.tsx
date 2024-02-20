import { memo, FC } from 'react';

import { MATOMO_CLICK_EVENTS } from 'consts/matomo-click-events';
import { L2Wsteth } from 'shared/banners/l2-wsteth';
import { FormController } from 'shared/hook-form/form-controller/form-controller';
import { TransactionModalProvider } from 'shared/transaction-modal';
import { InputWrap, WrapBlock } from 'features/wsteth/shared/styles';

import { UnwrapStats } from './unwrap-stats';
import { UnwrapFormTxModal } from './unwrap-form-tx-modal';
import { UnwrapFormProvider } from '../unwrap-form-context';
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
          <L2Wsteth matomoEventLink={MATOMO_CLICK_EVENTS.l2BannerUnwrap} />
          <UnwrapStats />
          <UnwrapFormTxModal />
        </WrapBlock>
      </UnwrapFormProvider>
    </TransactionModalProvider>
  );
});
