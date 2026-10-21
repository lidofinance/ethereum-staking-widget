import type { FC } from 'react';
import { Block, Link, Text } from '@lidofinance/lido-ui';

import type { L2SlowStakeStatus } from 'modules/l2-staking';
import { FormatToken } from 'shared/formatters';

type SlowStakeStatusItemProps = {
  status: L2SlowStakeStatus;
};

// Placeholder: the stage as plain text, pending a design
const describe = (status: L2SlowStakeStatus): string => {
  switch (status.stage) {
    case 'sent':
      return 'Sent, waiting for CCIP to pick the message up';
    case 'in_transit':
      return `In transit to Ethereum (${status.ccipStatus})`;
    case 'transport_failed':
      return status.readyForManualExecution
        ? 'CCIP could not deliver it; manual execution is open'
        : 'CCIP could not deliver it';
    case 'parked':
      return 'Delivered to Ethereum, but the stake failed; funds are parked and can be retried';
    case 'tokens_recovered':
      return 'The parked funds were recovered by the DAO';
    case 'staked':
      return 'Staked on Ethereum, wstETH is on its way back';
    case 'delivered':
      return 'wstETH delivered';
  }
};

export const SlowStakeStatusItem: FC<SlowStakeStatusItemProps> = ({
  status,
}) => (
  <Block data-testid="slowStakeStatus">
    <Text size="xs">
      <FormatToken amount={status.amount} symbol="ETH" /> via Ethereum
    </Text>
    <Text size="xs">{describe(status)}</Text>
    {'stakedAmount' in status && (
      <Text size="xs">
        Staked: <FormatToken amount={status.stakedAmount} symbol="wstETH" />
      </Text>
    )}
    <Text size="xs">
      <Link href={status.ccipExplorerUrl} target="_blank" rel="noreferrer">
        CCIP message
      </Link>
    </Text>
  </Block>
);
