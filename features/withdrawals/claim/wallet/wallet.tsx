import { memo } from 'react';

import { Divider } from '@lidofinance/lido-ui';
import { useSDK } from '@lido-sdk/react';

import {
  WalletWrapperStyled,
  WalletMyRequests,
} from 'features/withdrawals/shared';
import { useDappStatus } from 'shared/hooks/use-dapp-status';
import { useLidoMultichainFallbackCondition } from 'shared/hooks/use-lido-multichain-fallback-condition';
import {
  CardAccount,
  CardRow,
  Fallback,
  LidoMultichainFallback,
} from 'shared/wallet';
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
  const { isDappActive } = useDappStatus();
  const { showLidoMultichainFallback } = useLidoMultichainFallbackCondition();

  if (showLidoMultichainFallback) {
    return (
      <LidoMultichainFallback textEnding={'to claim withdrawals'} {...props} />
    );
  }

  if (!isDappActive) {
    return <Fallback {...props} />;
  }

  return <WalletComponent {...props} />;
});
