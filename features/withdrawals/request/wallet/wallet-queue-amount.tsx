import { Text } from '@lidofinance/lido-ui';
import { BigNumber } from 'ethers';
import { useTokenAddress } from '@lido-sdk/react';
import { TOKENS } from '@lido-sdk/constants';

import { CardBalance } from 'shared/wallet';
import { FormatToken } from 'shared/formatters';
import { TokenToWallet } from 'shared/components';

export const WalletQueueAmount = () => {
  const stethAddress = useTokenAddress(TOKENS.STETH);
  // const { unfinalizedStETH } = useRequestWalletData();

  const amountQueue = (
    <>
      <FormatToken amount={BigNumber.from(0)} symbol="stETH" />
      <TokenToWallet address={stethAddress} />
      <Text size={'xxs'} color={'secondary'}>
        ≈ <FormatToken amount={BigNumber.from(0)} symbol="ETH" />
      </Text>
    </>
  );

  return (
    <CardBalance
      small
      title="On pending now"
      loading={false}
      value={amountQueue}
    />
  );
};
