import { memo } from 'react';
import { useWatch } from 'react-hook-form';

import { CHAINS, TOKENS } from '@lido-sdk/constants';
import { Divider } from '@lidofinance/lido-ui';
import { useSDK } from '@lido-sdk/react';

import { getConfig } from 'config';
import { WalletMyRequests } from 'features/withdrawals/shared';
import { WalletWrapperStyled } from 'features/withdrawals/shared';
import {
  CardAccount,
  CardRow,
  Fallback,
  LidoMultichainFallback,
} from 'shared/wallet';
import { useDappStatus } from 'shared/hooks/use-dapp-status';
import { useLidoMultichainFallbackCondition } from 'shared/hooks/use-lido-multichain-fallback-condition';
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
  const { defaultChain } = getConfig();
  const { isWalletConnected, isDappActive, isAccountActiveOnL2 } =
    useDappStatus();
  const { showLidoMultichainFallback } = useLidoMultichainFallbackCondition();

  if (showLidoMultichainFallback) {
    return (
      <LidoMultichainFallback
        textEnding={'to request withdrawals'}
        {...props}
      />
    );
  }

  if (isAccountActiveOnL2) {
    return (
      <LidoMultichainFallback
        chainId={10}
        textEnding={'to request withdrawals'}
        {...props}
      />
    );
  }

  if (isWalletConnected && !isDappActive) {
    return (
      <Fallback
        error={`Unsupported chain. Please switch to ${CHAINS[defaultChain]} in your wallet.`}
        {...props}
      />
    );
  }

  if (!isDappActive) {
    return <Fallback {...props} />;
  }

  return <WalletComponent {...props} />;
});
