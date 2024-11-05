import { Divider } from '@lidofinance/lido-ui';

import {
  WalletWrapperStyled,
  WalletMyRequests,
} from 'features/withdrawals/shared';
import { CardAccount, CardRow, Fallback } from 'shared/wallet';

import { WalletAvailableAmount } from './wallet-availale-amount';
import { WalletPendingAmount } from './wallet-pending-amount';

export const WalletComponent = () => {
  return (
    <WalletWrapperStyled data-testid="claimCardSection">
      <CardRow>
        <WalletAvailableAmount />
        <CardAccount />
      </CardRow>
      <Divider />
      <CardRow>
        <WalletMyRequests />
        <WalletPendingAmount />
      </CardRow>
    </WalletWrapperStyled>
  );
};

export const ClaimWallet = () => {
  return (
    <Fallback toActionText="to claim withdrawals">
      <WalletComponent />
    </Fallback>
  );
};
