import { FC, memo } from 'react';

import { InputWrap, WrapBlock } from 'features/wsteth/shared/styles';
import { VaultsBannerInfo } from 'shared/banners/vaults-banner-info';
import { FormController } from 'shared/hook-form/form-controller/form-controller';

import { UnwrapStats } from './unwrap-stats';
import { UnwrapFormProvider } from '../unwrap-form-context';
import { TokenAmountInputUnwrap } from '../unwrap-form-controls/amount-input-unwrap';
import { SubmitButtonUnwrap } from '../unwrap-form-controls/submit-button-unwrap';

export const UnwrapForm: FC = memo(() => {
  return (
    <UnwrapFormProvider>
      <WrapBlock data-testid="unwrapForm">
        <FormController>
          <InputWrap>
            <TokenAmountInputUnwrap />
          </InputWrap>
          <SubmitButtonUnwrap />
        </FormController>
        <VaultsBannerInfo />
        <UnwrapStats />
      </WrapBlock>
    </UnwrapFormProvider>
  );
});
