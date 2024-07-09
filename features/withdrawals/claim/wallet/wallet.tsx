import { memo, useMemo } from 'react';
import { useAccount } from 'wagmi';

import { Divider } from '@lidofinance/lido-ui';
import { useSDK } from '@lido-sdk/react';

import { L2_CHAINS } from 'consts/chains';
import {
  WalletWrapperStyled,
  WalletMyRequests,
} from 'features/withdrawals/shared';
import { CardAccount, CardRow, Fallback, L2Fallback } from 'shared/wallet';
import type { WalletComponentType } from 'shared/wallet/types';
import { useIsConnectedWalletAndSupportedChain } from 'shared/hooks/use-is-connected-wallet-and-supported-chain';

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
  const { chainId } = useAccount();
  const isActiveWallet = useIsConnectedWalletAndSupportedChain();

  const isChainL2 = useMemo(() => {
    return (
      Object.values(L2_CHAINS).indexOf(chainId as unknown as L2_CHAINS) > -1
    );
  }, [chainId]);

  if (isChainL2) {
    return <L2Fallback {...props} />;
  }

  if (!isActiveWallet) {
    return <Fallback {...props} />;
  }

  return <WalletComponent {...props} />;
});
