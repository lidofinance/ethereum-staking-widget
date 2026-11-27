import { Position } from '../position';

import { StakeFormContext } from './stake-form-context';
import { StakeTxInfo } from './stake-tx-info';
import { StakeInput } from './stake-input';
import { Submit } from './submit';

import { StyledFormController } from './styles';
import { TransactionStageModalProvider } from 'features/stake-v2/utils';

export const StakeForm = () => {
  return (
    <TransactionStageModalProvider>
      <StakeFormContext>
        <StyledFormController>
          <Position />
          <StakeInput />
          <StakeTxInfo />
          <Submit />
        </StyledFormController>
      </StakeFormContext>
    </TransactionStageModalProvider>
  );
};
