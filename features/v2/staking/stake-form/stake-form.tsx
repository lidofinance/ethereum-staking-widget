import { Position } from '../position';

import { StakeTxInfo } from './stake-tx-info';
import { StakeInput } from './stake-input';
import { Submit } from './submit';

import { StyledForm } from './styles';

export const StakeForm = () => {
  return (
    <StyledForm>
      <Position />
      <StakeInput />
      <StakeTxInfo />
      <Submit />
    </StyledForm>
  );
};
