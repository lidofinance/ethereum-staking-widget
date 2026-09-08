import { useWatch } from 'react-hook-form';
import { Question, Tooltip } from '@lidofinance/lido-ui';

import { USD_WITHDRAW_TOKEN_TEXT } from '../consts';
import { asUsdWithdrawToken } from '../../utils';
import { UsdVaultWithdrawFormValues } from '../form-context/types';
import { UsdVaultWithdrawWillReceiveSelect } from './withdraw-will-receive-select';
import { WillReceiveContainer, WillReceiveLabel } from './styles';

export const UsdVaultWithdrawWillReceive = () => {
  const token = useWatch<UsdVaultWithdrawFormValues, 'token'>({
    name: 'token',
  });

  return (
    <WillReceiveContainer data-testid="will-receive">
      <WillReceiveLabel>
        You will receive{' '}
        <Tooltip
          placement="bottomLeft"
          title={
            USD_WITHDRAW_TOKEN_TEXT[asUsdWithdrawToken(token)].willReceiveHelp
          }
        >
          <Question
            style={{
              height: 20,
              width: 20,
              color: 'var(--lido-color-textSecondary)',
              verticalAlign: 'middle',
            }}
          />
        </Tooltip>
      </WillReceiveLabel>
      <UsdVaultWithdrawWillReceiveSelect />
    </WillReceiveContainer>
  );
};
