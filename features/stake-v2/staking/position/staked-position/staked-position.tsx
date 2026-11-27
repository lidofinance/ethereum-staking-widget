import { useRef, useState } from 'react';
import { Popover, Typography } from '@lidofinance/lido-app-ui';

import { useCrossStakingChainPosition } from 'modules/web3';
import { FormatPercent, FormatPrice, FormatToken } from 'shared/formatters';
import { useLidoApr } from 'shared/hooks';

import { Loader, toMotionState, useDelayedShow } from '../../../utils';

import { PositionPopover } from './position-popover';
import {
  ChevronDown,
  PositionAmount,
  PositionAPR,
  PositionGrid,
  PositionTitle,
} from './styles';

export const StakedPosition = () => {
  const [isPositionOpen, setIsPositionOpen] = useState(false);
  // the popover renders in a portal, so it can anchor to the trigger from here
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
          <Loader width="40px" isLoading={isPositionLoading}>
            {!hasPosition ? (
              <Typography
                variant="bodyLarge"
                weight="medium"
                as="span"
                color="tertiary"
              >
                No position
              </Typography>
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
