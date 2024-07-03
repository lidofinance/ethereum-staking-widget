import { memo } from 'react';
import { useWatch } from 'react-hook-form';
import { useAccount } from 'wagmi';
import { TOKENS } from '@lido-sdk/constants';
import { Divider } from '@lidofinance/lido-ui';
import { useWeb3 } from 'reef-knot/web3-react';
import { useSDK } from '@lido-sdk/react';

import { L2_CHAINS } from 'consts/chains';
import { CardAccount, CardRow, Fallback, L2Fallback } from 'shared/wallet';
import { WalletMyRequests } from 'features/withdrawals/shared';
import { WalletWrapperStyled } from 'features/withdrawals/shared';
import { useChainIdWithoutAccount } from 'shared/hooks/use-chain-id-without-account';
import type { WalletComponentType } from 'shared/wallet/types';

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
