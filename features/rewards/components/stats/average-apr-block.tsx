import { FC } from 'react';
import { Box, Question, Tooltip } from '@lidofinance/lido-ui';

import NumberFormat from 'features/rewards/components/NumberFormat';
import { useRewardsHistory } from 'features/rewards/hooks';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

import { Item } from './components/item';
import { FlexCenter } from './components/styles';

export const AverageAprBlock: FC = () => {
  const { isWalletConnected, isSupportedChain } = useDappStatus();
  const { data, initialLoading: loading } = useRewardsHistory();

  return (
    <Item
      loading={loading}
      dataTestId="averageAprBlock"
      title={
        <>
          <FlexCenter>
            Average APR
            <Tooltip title={'APR on stETH over your staking period'}>
              <Question />
            </Tooltip>
          </FlexCenter>
        </>
      }
      value={
        <>
          {(isWalletConnected && !isSupportedChain) ||
          !parseFloat(data?.averageApr || '0') ? (
            '—'
          ) : (
            <>
              <NumberFormat number={data?.averageApr} percent />
              <Box display="inline-block" pl="3px">
                %
              </Box>
            </>
          )}
        </>
      }
      valueDataTestId="averageApr"
    />
  );
};
