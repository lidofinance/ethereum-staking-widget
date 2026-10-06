import { FormControllerStyled, StakeBlock } from '../stake-form/styles';

import { L2StakeAmountInput } from './controls/l2-stake-amount-input';
import { L2StakeSubmitButton } from './controls/l2-stake-submit-button';
import { L2StakeFormInfo } from './l2-stake-form-info';
import { L2StakeLiquidityBanner } from './l2-stake-liquidity-banner';

export const L2StakeForm = () => {
  return (
    <StakeBlock data-testid="stakeForm">
      <FormControllerStyled>
        <L2StakeAmountInput />
        <L2StakeSubmitButton />
      </FormControllerStyled>
      <L2StakeLiquidityBanner />
      <L2StakeFormInfo />
    </StakeBlock>
  );
};
