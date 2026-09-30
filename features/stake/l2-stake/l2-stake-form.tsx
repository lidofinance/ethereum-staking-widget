import { L2StakeAmountInput } from './controls/l2-stake-amount-input';
import { L2StakeSubmitButton } from './controls/l2-stake-submit-button';
import { L2StakeFormInfo } from './l2-stake-form-info';

import { FormControllerStyled, StakeBlock } from '../stake-form/styles';

export const L2StakeForm = () => {
  return (
    <StakeBlock data-testid="stakeForm">
      <FormControllerStyled>
        <L2StakeAmountInput />
        <L2StakeSubmitButton />
      </FormControllerStyled>
      <L2StakeFormInfo />
    </StakeBlock>
  );
};
