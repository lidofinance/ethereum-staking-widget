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
import { useLidoApr } from 'hooks/useLidoApr';
import { FC, memo, useMemo } from 'react';
import { FlexCenterVertical } from './styles';

const LidoStats: FC = () => {
  const { chainId } = useSDK();

  const etherscanLink = useMemo(
    () => getEtherscanTokenLink(chainId, getStethAddress(chainId)),
    [chainId],
  );

  const lidoApr = useLidoApr();

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
                <Tooltip title={LIDO_APR_TOOLTIP_TEXT}>
                  <Question />
                </Tooltip>
              </FlexCenterVertical>
            }
            loading={lidoApr.initialLoading}
            highlight
          >
            {lidoApr.data}%
          </DataTableRow>
        </DataTable>
      </Block>
    </Section>
  );
};

export default memo(LidoStats);
