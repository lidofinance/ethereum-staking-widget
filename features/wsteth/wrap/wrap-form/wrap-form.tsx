import { memo } from 'react';

import { FormController } from 'shared/hook-form/form-controller';

import { WrapFormStats } from './wrap-stats';
import { WrapBlock } from '../../shared/styles';
import { WrapFormProvider } from '../wrap-form-context/wrap-form-context';
import { InputGroupWrap } from '../wrap-form-controls/input-group-wrap';
import { SubmitButtonWrap } from '../wrap-form-controls/submit-button-wrap';

export const WrapForm: React.FC = memo(() => {
  return (
    <WrapFormProvider>
      <WrapBlock data-testid="wrapForm">
        <FormController>
          <InputGroupWrap />
          <SubmitButtonWrap />
        </FormController>
        <WrapFormStats />
      </WrapBlock>
    </WrapFormProvider>
  );
});
