import type { FC } from 'react';

import type { L2SlowStakeStatus } from 'modules/l2-staking';
import { FormatPrice } from 'shared/formatters';
import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { useDappStatus } from 'modules/web3';

import { getSlowStakeExplorerLink } from './get-slow-stake-explorer-link';
import {
  SlowStakeStatusItemContainer,
  StatusContent,
  EthIconStyled,
  AmountStyled,
  EndCell,
  ExternalLinkIconStyled,
  ScanLink,
} from './styles';

type SlowStakeStatusItemProps = {
  status: L2SlowStakeStatus;
};

// "21 Aug 2026 12:23", in the viewer's time zone; the en-GB order, as the
// day-first shape is not the app locale's
const formatSentAt = (timestampMs: number): string => {
  const sentAt = new Date(timestampMs);
  const date = sentAt.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = sentAt.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${date} ${time}`;
};

const getStatusTitle = (status: L2SlowStakeStatus): string => {
  switch (status.stage) {
    // in progress
    case 'sent':
    case 'in_transit':
    case 'bridging':
      return 'Staking Shuttle is in flight';
    // completed successfully
    case 'delivered':
      return 'wstETH delivered';
    // failed on Ethereum and pushed through by the recovery process
    case 'recovered':
      return 'Staking Shuttle recovered';
    // there was an error
    case 'transport_failed':
    case 'parked':
    case 'relay_failed':
    case 'unresolved':
      return 'Staking Shuttle encountered an error and will be recovered';
  }
};

const getStatusDescription = (status: L2SlowStakeStatus): string => {
  switch (status.stage) {
    // in progress
    case 'sent':
    case 'in_transit':
    case 'bridging':
      return 'Your dedicated Staking Shuttle is processing your stake. The process usually takes about 1 hour 30 minutes.';
    // completed successfully
    case 'delivered':
      return 'The wstETH has been successfully delivered to your wallet.';
    // failed on Ethereum and pushed through by the recovery process
    case 'recovered':
      return 'The Staking Shuttle hit an error on Ethereum and was recovered. The wstETH has been sent to your wallet through the bridge.';
    // there was an error
    case 'transport_failed':
    case 'parked':
    case 'relay_failed':
    case 'unresolved':
      return 'The Staking Shuttle encountered an error. The funds are safe and will be recovered soon by automated process.';
  }
};

export const SlowStakeStatusItem: FC<SlowStakeStatusItemProps> = ({
  status,
}) => {
  const { usdAmount } = useEthUsd(status.amount);
  const { chainId } = useDappStatus();
  const explorerLink = getSlowStakeExplorerLink(status, chainId);
  return (
    <SlowStakeStatusItemContainer data-testid="slowStakeStatus">
      <span>{getStatusTitle(status)}</span>
      <StatusContent>
        {/* first column, spans two rows */}
        <EthIconStyled />
        {/* row 1 */}
        <AmountStyled amount={status.amount} symbol="ETH" />
        <EndCell>{formatSentAt(status.sendTimestampMs)}</EndCell>
        {/* row 2 */}
        <FormatPrice amount={usdAmount} />
        <ScanLink href={explorerLink.url} target="_blank" rel="noreferrer">
          {explorerLink.text}
          <ExternalLinkIconStyled />
        </ScanLink>
      </StatusContent>
      <span>{getStatusDescription(status)}</span>
    </SlowStakeStatusItemContainer>
  );
};
