import { memo } from 'react';
import { useWeb3 } from 'reef-knot/web3-react';
import { useAccount } from 'wagmi';
import { Divider } from '@lidofinance/lido-ui';
import { useSDK } from '@lido-sdk/react';

import { L2_CHAINS } from 'consts/chains';
import { CardAccount, CardRow, Fallback, L2Fallback } from 'shared/wallet';
import type { WalletComponentType } from 'shared/wallet/types';
import { useChainIdWithoutAccount } from 'shared/hooks/use-chain-id-without-account';
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
  const chainIdWithoutAccount = useChainIdWithoutAccount();
  const { chainId: accountChainId } = useAccount();
  const { active } = useWeb3();

  const _chainId = accountChainId || chainIdWithoutAccount;

  // The widget currently doesn't support L2 networks so there is no point in checking `active from useWeb3()` first
  if (Object.values(L2_CHAINS).indexOf(_chainId as unknown as L2_CHAINS) > -1) {
    return <L2Fallback {...props} />;
  }

  return active ? <WalletComponent {...props} /> : <Fallback {...props} />;
});
