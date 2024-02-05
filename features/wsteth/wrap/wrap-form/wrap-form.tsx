import { memo } from 'react';

import { WrapFormStats } from './wrap-stats';
import { WrapBlock } from '../../shared/styles';
import { WrapFormProvider } from '../wrap-form-context/wrap-form-context';
import { FormController } from 'shared/hook-form/form-controller';
import { TokenSelectWrap } from '../wrap-form-controls/token-select-wrap';
import { TokenAmountInputWrap } from '../wrap-form-controls/token-amount-input-wrap';
import { SubmitButtonWrap } from '../wrap-form-controls/submit-button-wrap';

import { InputGroupHookForm } from 'shared/hook-form/controls/input-group-hook-form';
import { L2Wsteth } from 'shared/banners/l2-wsteth';
import { MATOMO_CLICK_EVENTS } from 'config';

export const WrapForm: React.FC = memo(() => {
  return (
    <WrapFormProvider>
      <WrapBlock data-testid="wrapForm">
        <FormController>
          <InputGroupHookForm errorField="amount">
            <TokenSelectWrap />
            <TokenAmountInputWrap />
          </InputGroupHookForm>
          <SubmitButtonWrap />
        </FormController>
        <L2Wsteth matomoEventLink={MATOMO_CLICK_EVENTS.l2BannerWrap} />
        <WrapFormStats />
      </WrapBlock>
    </WrapFormProvider>
  );
});
