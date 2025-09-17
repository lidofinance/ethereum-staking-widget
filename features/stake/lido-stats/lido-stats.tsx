import { FC, memo, useMemo } from 'react';

import { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk/common';
import { Block, DataTable, Question, Tooltip } from '@lidofinance/lido-ui';

import { config } from 'config';
import { LIDO_APR_TOOLTIP_TEXT, DATA_UNAVAILABLE } from 'consts/text';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';
import { useDappStatus } from 'modules/web3';

import { Section, MatomoLink } from 'shared/components';
import { useLidoApr, useLidoStats } from 'shared/hooks';
import { useTokenAddress } from 'shared/hooks/use-token-address';
import { getEtherscanTokenLink } from 'utils/etherscan';

import { FlexCenterVertical } from './styles';
import { LidoStatsItem } from './lido-stats-item';

const isStatItemAvailable = (val: any): boolean => {
  return val && val !== 'N/A';
};

export const LidoStats: FC = memo(() => {
  const { chainId } = useDappStatus();
  const lidoApr = useLidoApr();
  const lidoStats = useLidoStats();

  const stethAddress = useTokenAddress(LIDO_TOKENS.steth);
  const etherscanLink = useMemo(() => {
    return getEtherscanTokenLink(chainId, stethAddress ?? '');
  }, [chainId, stethAddress]);

  if (!lidoStats.data) {
    return null;
  }

  const showApr = !config.ipfsMode || isStatItemAvailable(lidoApr.apr);
  const showTotalStaked =
    !config.ipfsMode || isStatItemAvailable(lidoStats.data.totalStaked);
  const showStakers =
    !config.ipfsMode || isStatItemAvailable(lidoStats.data.stakers);
  const showMarketCap =
    !config.ipfsMode || isStatItemAvailable(lidoStats.data.marketCap);

  if (!showApr && !showTotalStaked && !showStakers && !showMarketCap) {
    return null;
  }

  return (
    <Section
      title="Statistics of the Lido protocol"
      headerDecorator={
        <MatomoLink
          href={etherscanLink}
          data-testid="statEtherscanBtn"
          matomoEvent={MATOMO_CLICK_EVENTS_TYPES.viewEtherscanOnStakePage}
        >
          View on Etherscan
        </MatomoLink>
      }
    >
      <Block>
        <DataTable>
          <LidoStatsItem
            title={
              <FlexCenterVertical data-testid="aprTooltip">
                Annual percentage rate *
                <Tooltip title={LIDO_APR_TOOLTIP_TEXT}>
                  <Question />
                </Tooltip>
              </FlexCenterVertical>
            }
            show={showApr}
            loading={lidoApr.isLoading}
            dataTestId="lidoAPR"
            highlight
          >
            {lidoApr.apr ? `${lidoApr.apr}%` : DATA_UNAVAILABLE}
          </LidoStatsItem>

          <LidoStatsItem
            title="Total staked with Lido"
            show={showTotalStaked}
            loading={lidoStats.isLoading}
            dataTestId="totalStaked"
          >
            {lidoStats.data.totalStaked}
          </LidoStatsItem>

          <LidoStatsItem
            title="Stakers"
            show={showStakers}
            loading={lidoStats.isLoading}
            dataTestId="stakers"
          >
            {lidoStats.data.stakers}
          </LidoStatsItem>

          <LidoStatsItem
            title="stETH market cap"
            show={showMarketCap}
            loading={lidoStats.isLoading}
            dataTestId="stEthMarketCap"
          >
            {lidoStats.data.marketCap}
          </LidoStatsItem>
        </DataTable>
      </Block>
    </Section>
  );
});
