import { memo } from 'react';
import { Divider } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';
import { useSDK } from '@lido-sdk/react';

import { CardAccount, CardRow, Fallback } from 'shared/wallet';
import { WalletMyRequests } from 'features/withdrawals/shared';
import type { WalletComponentType } from 'shared/wallet/types';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { WalletWrapperStyled } from 'features/withdrawals/shared';

import { WalletStethBalance } from './wallet-steth-balance';
import { WalletWstethBalance } from './wallet-wsteth-balance';
import { WalletMode } from './wallet-mode';

export const WalletComponent = () => {
  const { account } = useSDK();
  const { isSteth } = useWithdrawals();

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
