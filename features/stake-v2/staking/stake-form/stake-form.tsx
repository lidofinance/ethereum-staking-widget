import { Position } from '../position';

import { StakeFormContext } from './stake-form-context';
import { StakeTxInfo } from './stake-tx-info';
import { StakeInput } from './stake-input';
import { Submit } from './submit';

import { StyledFormController } from './styles';

export const StakeForm = () => {
  return (
    <StakeFormContext>
      <StyledFormController>
        <Position />
        <StakeInput />
        <StakeTxInfo />
        <Submit />
      </StyledFormController>
    </StakeFormContext>
  );
};
