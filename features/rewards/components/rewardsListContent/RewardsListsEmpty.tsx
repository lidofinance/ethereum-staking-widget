import { FC } from 'react';

import { Divider } from '@lidofinance/lido-ui';

import { RewardsListEmptyWrapper } from './RewardsListsEmptyStyles';

export const RewardsListsEmpty: FC = () => {
  return (
    <>
      <Divider indents="lg" />
      <RewardsListEmptyWrapper>
        Connect your wallet or enter your Ethereum address to see the stats.
      </RewardsListEmptyWrapper>
    </>
  );
};
