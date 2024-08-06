import { memo } from 'react';

import { Divider } from '@lidofinance/lido-ui';
import { useSDK } from '@lido-sdk/react';

import { useConfig } from 'config';
import { CHAINS } from 'consts/chains';
import {
  WalletWrapperStyled,
  WalletMyRequests,
} from 'features/withdrawals/shared';
import { useDappStatus } from 'shared/hooks/use-dapp-status';
import { CardAccount, CardRow, Fallback, L2Fallback } from 'shared/wallet';
import type { WalletComponentType } from 'shared/wallet/types';

import { WalletAvailableAmount } from './wallet-availale-amount';
import { WalletPendingAmount } from './wallet-pending-amount';
import { overrideWithQAMockBoolean } from 'utils/qa';

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
  const { config } = useConfig();
  const { isL2Chain, isDappActive } = useDappStatus();

  // Display L2 banners only if defaultChain=Mainnet
  // Or via QA helpers override
  const showL2Chain = overrideWithQAMockBoolean(
    config.defaultChain === CHAINS.Mainnet,
    'mock-qa-helpers-show-l2-banners-on-testnet',
  );

  if (isL2Chain && showL2Chain) {
    return <L2Fallback textEnding={'to claim withdrawals'} {...props} />;
  }

  if (!isDappActive) {
    return <Fallback {...props} />;
  }

  return <WalletComponent {...props} />;
});
