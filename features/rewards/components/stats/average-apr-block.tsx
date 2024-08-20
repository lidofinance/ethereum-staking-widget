import { FC } from 'react';
import { Box, Link } from '@lidofinance/lido-ui';

import { config } from 'config';

import NumberFormat from 'features/rewards/components/NumberFormat';
import { useRewardsHistory } from 'features/rewards/hooks';

import { Item } from './components/item';

export const AverageAprBlock: FC = () => {
  const { data, initialLoading: loading } = useRewardsHistory();

  return (
    <Item
      loading={loading}
      dataTestId="averageAprBlock"
      title="Average APR"
      value={
        <>
          {parseFloat(data?.averageApr || '0') ? (
            <NumberFormat number={data?.averageApr} percent />
          ) : (
            '-'
          )}
          <Box display="inline-block" pl="3px">
            %
          </Box>
        </>
      }
      valueDataTestId="averageApr"
      underValue={
        <Link href={`${config.rootOrigin}/ethereum#apr`}>
          <Box data-testid="moreInfo">More info</Box>
        </Link>
      }
    />
  );
};
