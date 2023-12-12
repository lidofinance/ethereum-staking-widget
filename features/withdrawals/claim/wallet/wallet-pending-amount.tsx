import { TOKENS } from '@lido-sdk/constants';
import { useTokenAddress } from '@lido-sdk/react';

import { TokenToWallet } from 'shared/components/token-to-wallet/token-to-wallet';
import { CardBalance } from 'shared/wallet';
import { FormatToken } from 'shared/formatters';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';

export const WalletPendingAmount = () => {
  const stethAddress = useTokenAddress(TOKENS.STETH);
  const { data, initialLoading } = useClaimData();

  const pendingAmount = (
    <>
      <FormatToken
        showAmountTip
        amount={data?.pendingAmountOfStETH}
        symbol="stETH"
      />
      <TokenToWallet data-testid="addStethToWalletBtn" address={stethAddress} />
    </>
  );

  return (
    <CardBalance
      small
      title="My pending amount"
      loading={initialLoading}
      value={pendingAmount}
    />
  );
};
