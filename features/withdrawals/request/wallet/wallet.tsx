import { memo } from 'react';
import { useWatch } from 'react-hook-form';

import { TOKENS } from '@lido-sdk/constants';
import { Divider } from '@lidofinance/lido-ui';
import { useSDK } from '@lido-sdk/react';

import { WalletMyRequests } from 'features/withdrawals/shared';
import { WalletWrapperStyled } from 'features/withdrawals/shared';
import { CardAccount, CardRow, Fallback, L2Fallback } from 'shared/wallet';
import { useDappStatuses } from 'shared/hooks/use-dapp-statuses';
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
  const { isL2Chain, isDappActive } = useDappStatuses();

  if (isL2Chain) {
    return <L2Fallback {...props} />;
  }

  if (!isDappActive) {
    return <Fallback {...props} />;
  }

  return <WalletComponent {...props} />;
});
