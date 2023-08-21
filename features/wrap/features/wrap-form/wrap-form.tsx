import { memo } from 'react';

import { WrapFormStats } from './wrap-stats';
import { WrapFormTxModal } from './wrap-form-tx-modal';

import { useWrapFormData } from '../wrap-form-context';
import { MATOMO_CLICK_EVENTS } from 'config';
import { Block } from '@lidofinance/lido-ui';
import { L2Banner } from 'shared/l2-banner';
import { FormStyled } from 'features/wrap/styles';

import { TokenInput } from './controls/token-input';
import { AmountInput } from './controls/amount-input';
import { SubmitButton } from './controls/submit-button';
import { ErrorMessageInputGroup } from './controls/error-message-input-group';

export const WrapForm: React.FC = memo(() => {
  const { onSubmit } = useWrapFormData();
  return (
    <Block>
      <FormStyled autoComplete="off" onSubmit={onSubmit}>
        <ErrorMessageInputGroup>
          <TokenInput />
          <AmountInput />
        </ErrorMessageInputGroup>
        <SubmitButton />
        <L2Banner matomoEvent={MATOMO_CLICK_EVENTS.l2BannerWrap} />
      </FormStyled>
      <WrapFormStats />
      <WrapFormTxModal />
    </Block>
  );
});
