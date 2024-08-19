import { memo } from 'react';
import { useWatch } from 'react-hook-form';

import { TOKENS } from '@lido-sdk/constants';
import { Divider } from '@lidofinance/lido-ui';
import { useSDK } from '@lido-sdk/react';

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
  const { isDappActive } = useDappStatus();
  const { showLidoMultichainFallback } = useLidoMultichainFallbackCondition();

  if (showLidoMultichainFallback) {
    return (
      <LidoMultichainFallback
        textEnding={'to request withdrawals'}
        {...props}
      />
    );
  }

  if (!isDappActive) {
    return <Fallback {...props} />;
  }

  return <WalletComponent {...props} />;
});
