import { memo } from 'react';

import { Divider } from '@lidofinance/lido-ui';
import { useSDK } from '@lido-sdk/react';

import {
  WalletWrapperStyled,
  WalletMyRequests,
} from 'features/withdrawals/shared';
import { useDappStatuses } from 'shared/hooks/use-dapp-statuses';
import { CardAccount, CardRow, Fallback, L2Fallback } from 'shared/wallet';
import type { WalletComponentType } from 'shared/wallet/types';

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
  const { isChainL2, isDappActive } = useDappStatuses();

  if (isChainL2) {
    return <L2Fallback {...props} />;
  }

  if (!isDappActive) {
    return <Fallback {...props} />;
  }

  return <WalletComponent {...props} />;
});
