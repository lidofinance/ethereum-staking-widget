import { memo } from 'react';
import { Divider } from '@lidofinance/lido-ui';
import { useWeb3 } from 'reef-knot/web3-react';
import { useSDK } from '@lido-sdk/react';

import { CardAccount, CardRow, Fallback } from 'shared/wallet';
import type { WalletComponentType } from 'shared/wallet/types';
import {
  WalletWrapperStyled,
  WalletMyRequests,
} from 'features/withdrawals/shared';

import { WalletAvailableAmount } from './wallet-availale-amount';
import { WalletPendingAmount } from './wallet-pending-amount';

export const WalletComponent = () => {
  const { account } = useSDK();

  return (
    <WalletWrapperStyled data-testid="claimCardSection">
      <CardRow>
        <WalletAvailableAmount />
        <CardAccount account={account} />
      </CardRow>
      <Divider />
      <CardRow>
        <WalletMyRequests />
        <WalletPendingAmount />
      </CardRow>
    </WalletWrapperStyled>
  );
};

export const ClaimWallet: WalletComponentType = memo((props) => {
  const { active } = useWeb3();
  return active ? <WalletComponent {...props} /> : <Fallback {...props} />;
});
