import { useWatch } from 'react-hook-form';

import { Divider } from '@lidofinance/lido-ui';

import { WalletMyRequests } from 'features/withdrawals/shared';
import { WalletWrapperStyled } from 'features/withdrawals/shared';
import { CardAccount, CardRow, Fallback } from 'shared/wallet';

import { RequestFormInputType } from '../request-form-context';
import { TOKENS_TO_WITHDRAWLS } from '../../types/tokens-withdrawable';

import { WalletStethBalance } from './wallet-steth-balance';
import { WalletWstethBalance } from './wallet-wsteth-balance';
import { WalletMode } from './wallet-mode';

export const WalletComponent = () => {
  const token = useWatch<RequestFormInputType, 'token'>({ name: 'token' });
  const isSteth = token === TOKENS_TO_WITHDRAWLS.stETH;

  return (
    <WalletWrapperStyled data-testid="requestCardSection">
      <CardRow>
        {isSteth ? <WalletStethBalance /> : <WalletWstethBalance />}
        <CardAccount />
      </CardRow>
      <Divider />
      <CardRow>
        <WalletMyRequests />
        <WalletMode />
      </CardRow>
    </WalletWrapperStyled>
  );
};

export const RequestWallet = () => {
  return (
    <Fallback toActionText="to request withdrawals">
      <WalletComponent />
    </Fallback>
  );
};
