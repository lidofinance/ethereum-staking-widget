import { FC, memo, useMemo } from 'react';
import { getEtherscanTokenLink } from '@lido-sdk/helpers';
import { useSDK } from '@lido-sdk/react';
import {
  Block,
  DataTable,
  DataTableRow,
  Link,
  Question,
  Tooltip,
} from '@lidofinance/lido-ui';
import { trackEvent } from '@lidofinance/analytics-matomo';
import { Section } from 'shared/components';
import { useLidoApr, useLidoStats } from 'shared/hooks';
import {
  getStethAddress,
  LIDO_APR_TOOLTIP_TEXT,
  DATA_UNAVAILABLE,
  MATOMO_EVENTS,
} from 'config';
import { FlexCenterVertical } from './styles';

export const LidoStats: FC = memo(() => {
  const { chainId } = useSDK();
  const etherscanLink = useMemo(
    // TODO: add a way to type useSDK hook
    () => getEtherscanTokenLink(chainId, getStethAddress(chainId as number)),
    [chainId],
  );
  const lidoApr = useLidoApr();
  const lidoStats = useLidoStats();

  const linkClickHandler = () =>
    trackEvent(...MATOMO_EVENTS.clickViewEtherscanOnStakePage);

  return (
    <Section
      title="Lido statistics"
      headerDecorator={
        <Link href={etherscanLink} onClick={linkClickHandler}>
          View on Etherscan
        </Link>
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
            {lidoApr.data ? `${lidoApr.data}%` : DATA_UNAVAILABLE}
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
