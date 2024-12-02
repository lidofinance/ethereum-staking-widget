import { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk/common';

import { TokenToWallet } from 'shared/components/token-to-wallet/token-to-wallet';
import { CardBalance } from 'shared/wallet';
import { FormatToken } from 'shared/formatters';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';
import { useTokenAddress } from 'shared/hooks/use-token-address';

export const WalletPendingAmount = () => {
  const stethAddress = useTokenAddress(LIDO_TOKENS.steth);
  const { data, isLoading } = useClaimData();

  const pendingAmount = (
    <>
      <FormatToken amount={data?.pendingAmountOfStETH} symbol="stETH" />
      <TokenToWallet data-testid="addStethToWalletBtn" address={stethAddress} />
    </>
  );

  return (
    <CardBalance
      small
      data-testid="myPendingAmount"
      title="My pending amount"
      loading={isLoading}
      value={pendingAmount}
    />
  );
};
