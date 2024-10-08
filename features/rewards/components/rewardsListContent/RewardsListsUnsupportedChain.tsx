import { FC } from 'react';
import { Divider } from '@lidofinance/lido-ui';

import { useConfig } from 'config';
import { CHAINS } from 'consts/chains';
import { RewardsListEmptyWrapper } from './RewardsListsEmptyStyles';

export const RewardsListsUnsupportedChain: FC = () => {
  const {
    config: { defaultChain },
  } = useConfig();

  return (
    <>
      <Divider indents="lg" />
      <RewardsListEmptyWrapper>
        <p>
          Please switch to {CHAINS[defaultChain]} in your wallet to see the
          stats.
        </p>
      </RewardsListEmptyWrapper>
    </>
  );
};
