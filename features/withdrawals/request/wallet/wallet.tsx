import { useWatch } from 'react-hook-form';

import { TOKENS } from '@lido-sdk/constants';
import { Divider } from '@lidofinance/lido-ui';

import { WalletMyRequests } from 'features/withdrawals/shared';
import { WalletWrapperStyled } from 'features/withdrawals/shared';
import { CardAccount, CardRow, Fallback } from 'shared/wallet';

import { WalletStethBalance } from './wallet-steth-balance';
import { WalletWstethBalance } from './wallet-wsteth-balance';
import { WalletMode } from './wallet-mode';
import { RequestFormInputType } from '../request-form-context';

export const WalletComponent = () => {
  const token = useWatch<RequestFormInputType, 'token'>({ name: 'token' });
  const isSteth = token === TOKENS.STETH;

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
