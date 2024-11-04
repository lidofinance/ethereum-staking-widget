import { FC } from 'react';
import { Divider } from '@lidofinance/lido-ui';

import { RewardsListEmptyWrapper } from './RewardsListsEmptyStyles';
import { useDappStatus } from 'modules/web3';
import { joinWithOr } from 'utils/join-with-or';

export const RewardsListsUnsupportedChain: FC = () => {
  const { supportedChainLabels } = useDappStatus();

  return (
    <>
      <Divider indents="lg" />
      <RewardsListEmptyWrapper>
        <p>
          Please switch to {joinWithOr(supportedChainLabels)} in your wallet to
          see the stats.
        </p>
      </RewardsListEmptyWrapper>
    </>
  );
};
