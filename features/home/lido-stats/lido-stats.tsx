import { FC, memo, useMemo } from 'react';
import { getEtherscanTokenLink } from '@lido-sdk/helpers';
import { useSDK } from '@lido-sdk/react';
import { getTokenAddress, TOKENS } from '@lido-sdk/constants';
import {
  Block,
  DataTable,
  DataTableRow,
  Question,
  Tooltip,
} from '@lidofinance/lido-ui';
import { Section, MatomoLink } from 'shared/components';
import {
  LIDO_APR_TOOLTIP_TEXT,
  DATA_UNAVAILABLE,
  MATOMO_CLICK_EVENTS_TYPES,
} from 'config';
import { useLidoApr, useLidoStats } from 'shared/hooks';
import { FlexCenterVertical } from './styles';

export const LidoStats: FC = memo(() => {
  const { chainId } = useSDK();
  const etherscanLink = useMemo(() => {
    return getEtherscanTokenLink(
      chainId,
      getTokenAddress(chainId, TOKENS.STETH),
    );
  }, [chainId]);
  const lidoApr = useLidoApr();
  const lidoStats = useLidoStats();

  return (
    <Section
      title="Lido statistics"
      headerDecorator={
        <MatomoLink
          href={etherscanLink}
          matomoEvent={MATOMO_CLICK_EVENTS_TYPES.viewEtherscanOnStakePage}
        >
          View on Etherscan
        </MatomoLink>
      }
    >
      <Block>
        <DataTable>
          <DataTableRow
            title={
              <FlexCenterVertical>
                Annual percentage rate
                <Tooltip title={LIDO_APR_TOOLTIP_TEXT}>
                  <Question />
                </Tooltip>
              </FlexCenterVertical>
            }
            loading={lidoApr.initialLoading}
            highlight
          >
            {lidoApr.apr ? `${lidoApr.apr}%` : DATA_UNAVAILABLE}
          </DataTableRow>
          <DataTableRow
            title="Total staked with Lido"
            loading={lidoStats.initialLoading}
          >
            {lidoStats.data.totalStaked}
          </DataTableRow>
          <DataTableRow title="Stakers" loading={lidoStats.initialLoading}>
            {lidoStats.data.stakers}
          </DataTableRow>
          <DataTableRow
            title="stETH market cap"
            loading={lidoStats.initialLoading}
          >
            {lidoStats.data.marketCap}
          </DataTableRow>
        </DataTable>
      </Block>
    </Section>
  );
});
