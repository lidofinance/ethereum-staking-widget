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
import Section from 'components/section/section';
import { getStethAddress, LIDO_APR_TOOLTIP_TEXT } from 'config';
import { useLidoApr, useLidoStats, useEthApr } from 'hooks';
import { FlexCenterVertical } from './styles';

const LidoStats: FC = () => {
  const { chainId } = useSDK();

  const etherscanLink = useMemo(
    () => getEtherscanTokenLink(chainId, getStethAddress(chainId)),
    [chainId],
  );

  const lidoApr = useLidoApr();
  const lidoStats = useLidoStats();
  const etrApr = useEthApr();

  return (
    <Section
      title="Lido statistics"
      headerDecorator={<Link href={etherscanLink}>View on Etherscan</Link>}
    >
      <Block>
        <DataTable>
          <DataTableRow
            title={
              <FlexCenterVertical>
                Annual percentage rate
                {/* TODO: why not work replaceAll here? */}
                <Tooltip
                  title={LIDO_APR_TOOLTIP_TEXT.replace(
                    /\$\{apr.eth\}/g,
                    etrApr.data as string,
                  )}
                >
                  <Question />
                </Tooltip>
              </FlexCenterVertical>
            }
            loading={lidoApr.initialLoading}
            highlight
          >
            {lidoApr.data}%
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
};

export default memo(LidoStats);
