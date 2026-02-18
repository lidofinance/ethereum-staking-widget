import type { FC } from 'react';
import { Block } from '@lidofinance/lido-ui';

import { EthVaultDepositForm } from '../deposit';
import { ETHWithdrawForm } from '../withdraw';
import {
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_WITHDRAW_SLUG,
  ETH_DEPOSIT_PATH,
  ETH_WITHDRAW_PATH,
} from '../../consts';
import { SwitchStyled } from './styles';

const routes = [
  {
    path: ETH_DEPOSIT_PATH,
    name: 'Deposit',
    // matomoEvent: MATOMO_EARN_EVENTS_TYPES.ethDepositTab, // TODO: add matomo event
  },
  {
    path: ETH_WITHDRAW_PATH,
    name: 'Withdraw',
    // matomoEvent: MATOMO_EARN_EVENTS_TYPES.ethWithdrawalTab, // TODO: add matomo event
  },
];

export const EthVaultPositionManager: FC<{
  action: typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;
}> = ({ action }) => {
  const isDeposit = action === EARN_VAULT_DEPOSIT_SLUG;
  const isWithdraw = action === EARN_VAULT_WITHDRAW_SLUG;
  return (
    <Block>
      <SwitchStyled routes={routes} checked={isWithdraw} fullwidth />
      {isDeposit && <EthVaultDepositForm />}
      {isWithdraw && <ETHWithdrawForm />}
    </Block>
  );
};
