import { memo } from 'react';
import { Block } from '@lidofinance/lido-ui';
import { L2Banner } from 'shared/l2-banner';
import { MATOMO_CLICK_EVENTS } from 'config';
import { UnwrapStats } from './unwrap-stats';
import { UnwrapFormTxModal } from './unwrap-form-tx-modal';
import { TransactionModalProvider } from 'features/withdrawals/contexts/transaction-modal-context';
import { UnwrapFormProvider } from '../unwrap-form-context';
import { UnwrapFormController } from '../unwrap-form-controls/unwrap-form-controller';
import { TokenAmountInputUnwrap } from '../unwrap-form-controls/amount-input-unwrap';
import { SubmitButtonUnwrap } from '../unwrap-form-controls/submit-button-unwrap';
import { InputWrap } from 'features/wsteth/shared/styles';

export const UnwrapForm: React.FC = memo(() => {
  return (
    <TransactionModalProvider>
      <UnwrapFormProvider>
        <Block>
          <UnwrapFormController>
            <InputWrap>
              <TokenAmountInputUnwrap />
            </InputWrap>
            <SubmitButtonUnwrap />
            <L2Banner matomoEvent={MATOMO_CLICK_EVENTS.l2BannerUnwrap} />
          </UnwrapFormController>
          <UnwrapStats />
          <UnwrapFormTxModal />
        </Block>
      </UnwrapFormProvider>
    </TransactionModalProvider>
  );
});
