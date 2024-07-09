import { memo, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { useAccount } from 'wagmi';

import { TOKENS } from '@lido-sdk/constants';
import { Divider } from '@lidofinance/lido-ui';
import { useSDK } from '@lido-sdk/react';

import { L2_CHAINS } from 'consts/chains';
import { WalletMyRequests } from 'features/withdrawals/shared';
import { WalletWrapperStyled } from 'features/withdrawals/shared';
import { CardAccount, CardRow, Fallback, L2Fallback } from 'shared/wallet';
import type { WalletComponentType } from 'shared/wallet/types';
import { useIsConnectedWalletAndSupportedChain } from 'shared/hooks/use-is-connected-wallet-and-supported-chain';

import { WalletStethBalance } from './wallet-steth-balance';
import { WalletWstethBalance } from './wallet-wsteth-balance';
import { WalletMode } from './wallet-mode';
import { RequestFormInputType } from '../request-form-context';

export const WalletComponent = () => {
  const { account } = useSDK();
  const token = useWatch<RequestFormInputType, 'token'>({ name: 'token' });
  const isSteth = token === TOKENS.STETH;

  return (
    <WalletWrapperStyled data-testid="requestCardSection">
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
