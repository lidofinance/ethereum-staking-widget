import { FC } from 'react';
import { Box, Question, Tooltip } from '@lidofinance/lido-ui';

import NumberFormat from 'features/rewards/components/NumberFormat';
import { useRewardsHistory } from 'features/rewards/hooks';

import { Item } from './components/item';
import { FlexCenter } from './components/styles';

export const AverageAprBlock: FC = () => {
  const { data, isLoading } = useRewardsHistory();

  return (
    <Item
      loading={isLoading}
      dataTestId="averageAprBlock"
      title={
        <FlexCenter>
          Average APR *
          <Tooltip title={'APR on stETH over your staking period'}>
            <Question />
          </Tooltip>
        </FlexCenter>
      }
      value={
        parseFloat(data?.averageApr || '0') ? (
          <>
            <NumberFormat number={data?.averageApr} percent />
            <Box display="inline-block" pl="3px">
              %
            </Box>
          </>
        ) : (
          '—'
        )
      }
      valueDataTestId="averageApr"
    />
  );
};
