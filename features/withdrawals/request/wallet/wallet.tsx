import { memo } from 'react';
import { Divider } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';
import { useSDK } from '@lido-sdk/react';

import { CardAccount, CardRow, Fallback } from 'shared/wallet';
import { WalletMyRequests } from 'features/withdrawals/shared';
import type { WalletComponentType } from 'shared/wallet/types';
import { WalletWrapperStyled } from 'features/withdrawals/shared';

import { WalletStethBalance } from './wallet-steth-balance';
import { WalletWstethBalance } from './wallet-wsteth-balance';
import { WalletMode } from './wallet-mode';
import { RequestFormInputType } from '../request-form-context';
import { useWatch } from 'react-hook-form';
import { TOKENS } from '@lido-sdk/constants';

export const WalletComponent = () => {
  const { account } = useSDK();
  const token = useWatch<RequestFormInputType, 'token'>({ name: 'token' });
  const isSteth = token === TOKENS.STETH;
  return (
    <WalletWrapperStyled>
      <CardRow>
        {isSteth ? <WalletStethBalance /> : <WalletWstethBalance />}
        <CardAccount account={account} />
      </CardRow>
      <Divider />
      <CardRow>
        <WalletMyRequests />
        <WalletMode />
      </CardRow>
    </WalletWrapperStyled>
  );
};

export const RequestWallet: WalletComponentType = memo((props) => {
  const { active } = useWeb3();
  return active ? <WalletComponent {...props} /> : <Fallback {...props} />;
});
