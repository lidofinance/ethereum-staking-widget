import { FormControllerStyled, StakeBlock } from '../stake-form/styles';

import { L2StakeInputGroup } from './controls/l2-stake-input-group';
import { L2StakeSubmitButton } from './controls/l2-stake-submit-button';
import { L2StakeFormInfo } from './l2-stake-form-info';
import { L2StakeLiquidityBanner } from './l2-stake-liquidity-banner';

export const L2StakeForm = () => {
  return (
    <StakeBlock data-testid="stakeForm">
      <FormControllerStyled>
        <L2StakeInputGroup />
        <L2StakeSubmitButton />
      </FormControllerStyled>
      <L2StakeLiquidityBanner />
      <L2StakeFormInfo />
    </StakeBlock>
  );
};
