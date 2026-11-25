import { useRef, useState } from 'react';
import { Body, Popover, Typography } from '@lidofinance/lido-app-ui';

import { useCrossStakingChainPosition, useDappStatus } from 'modules/web3';
import { FormatPercent, FormatPrice, FormatToken } from 'shared/formatters';
import { useLidoApr } from 'shared/hooks';

import { Loader, toMotionState, useDelayedShow } from '../../utils';

import { PendingWithdrawals } from './pending-withdrawals';
import { PositionPopover } from './position-popover';

import {
  BorderedCard,
  PositionGrid,
  PositionTitle,
  PositionAPR,
  PositionAmount,
  UnconnectedText,
  ChevronDown,
} from './styles';

const UnconnectedPosition = () => {
  const { isWalletResolving } = useDappStatus();
  const { data, isLoading } = useLidoApr();
  // isWalletResolving also has timeout but much larger,
  // useDelayedShow still UI protects against flashing apr skelton
  const shouldShow = useDelayedShow([isLoading]) && !isWalletResolving;

  const apr = data?.data?.smaApr;

  return (
    <BorderedCard>
      <UnconnectedText data-state={toMotionState(shouldShow)}>
        Stake with{' '}
        {apr && (
          <Loader isLoading={isLoading}>
            <FormatPercent decimals="percent" value={apr} /> APR
          </Loader>
        )}{' '}
        <Body as="span" color="tertiary">
          daily rewards, stay liquid
        </Body>
      </UnconnectedText>
    </BorderedCard>
  );
};

const ConnectedPosition = () => {
  const [isPositionOpen, setIsPositionOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // 'eth' sort gates on the wstETH rate whenever wstETH is held,
  // so the total never shows without its wstETH part
  const { data: position, isLoading: isPositionLoading } =
    useCrossStakingChainPosition({ sort: 'usd', tokenList: 'staked' });
  const { data: aprData, isLoading: isAprLoading } = useLidoApr();

  const shouldShow = useDelayedShow([isPositionLoading, isAprLoading]);
  const hasPosition = position?.totalEthValue !== 0n;

  const shouldShowPosition = hasPosition && isPositionOpen;

  return (
    <>
      <BorderedCard>
        <PositionGrid
          data-state={toMotionState(shouldShow)}
          onClick={(e) => {
            e.preventDefault();
            hasPosition && setIsPositionOpen(!isPositionOpen);
          }}
          ref={triggerRef}
          data-clickable={hasPosition ? 'true' : 'false'}
          data-toggled={isPositionOpen ? 'true' : 'false'}
        >
          <PositionTitle>
            Staked position{' '}
            {hasPosition && (
              <ChevronDown data-toggled={isPositionOpen ? 'true' : 'false'} />
            )}
          </PositionTitle>
          <PositionAmount>
            <Loader isLoading={isPositionLoading}>
              {!hasPosition ? (
                <Typography color="tertiary">No position</Typography>
              ) : (
                <>
                  <FormatToken amount={position?.totalEthValue} symbol="ETH" />
                  &nbsp;&nbsp;
                  <Typography
                    as="span"
                    color="secondary"
                    variant="description"
                    weight="regular"
                  >
                    <FormatPrice amount={position?.totalUsdValue} />
                  </Typography>
                </>
              )}
            </Loader>
          </PositionAmount>
          <PositionAPR>
            {aprData?.data?.smaApr && (
              <FormatPercent decimals="percent" value={aprData.data.smaApr} />
            )}{' '}
            APR
          </PositionAPR>
        </PositionGrid>
        <PendingWithdrawals />
      </BorderedCard>
      <Popover
        aria-label="Position details"
        open={shouldShowPosition}
        onClose={() => setIsPositionOpen(false)}
        anchorRef={triggerRef}
      >
        <PositionPopover position={position} />
      </Popover>
    </>
  );
};

export const Position = () => {
  const { isWalletConnected } = useDappStatus();

  if (!isWalletConnected) {
    return <UnconnectedPosition />;
  }

  return <ConnectedPosition />;
};
