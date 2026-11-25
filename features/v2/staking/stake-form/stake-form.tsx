import { RichInput } from '@lidofinance/lido-app-ui';
import { Position } from '../position';

import { StakeTxInfo } from './stake-tx-info';
import { Submit } from './submit';

import { StyledForm } from './styles';

export const StakeForm = () => {
  return (
    <StyledForm>
      <Position />
      <RichInput label="Stake amount" />
      <StakeTxInfo />
      <Submit />
    </StyledForm>
  );
};
