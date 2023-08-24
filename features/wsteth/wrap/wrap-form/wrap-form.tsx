import { memo } from 'react';

import { Block } from '@lidofinance/lido-ui';
import { L2Banner } from 'shared/l2-banner';
import { WrapFormStats } from './wrap-stats';
import { WrapFormTxModal } from './wrap-form-tx-modal';
import { WrapFormProvider } from '../wrap-form-context/wrap-form-context';
import { TransactionModalProvider } from 'features/withdrawals/contexts/transaction-modal-context';
import { FormController } from 'features/wsteth/shared/form-controller/form-controller';
import { TokenSelectWrap } from '../wrap-form-controls/token-select-wrap';
import { TokenAmountInputWrap } from '../wrap-form-controls/token-amount-input-wrap';
import { SubmitButtonWrap } from '../wrap-form-controls/submit-button-wrap';
import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';

import { MATOMO_CLICK_EVENTS } from 'config';

export const WrapForm: React.FC = memo(() => {
  return (
    <TransactionModalProvider>
      <WrapFormProvider>
        <Block>
          <FormController>
            <InputGroupHookForm errorField="amount">
              <TokenSelectWrap />
              <TokenAmountInputWrap />
            </InputGroupHookForm>
            <SubmitButtonWrap />
            <L2Banner matomoEvent={MATOMO_CLICK_EVENTS.l2BannerWrap} />
          </FormController>
          <WrapFormStats />
          <WrapFormTxModal />
        </Block>
      </WrapFormProvider>
    </TransactionModalProvider>
  );
});
