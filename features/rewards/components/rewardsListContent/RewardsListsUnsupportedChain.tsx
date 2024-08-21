import { FC, useMemo } from 'react';
import { Divider } from '@lidofinance/lido-ui';

import { useConfig } from 'config';
import { CHAINS } from 'consts/chains';
import { RewardsListEmptyWrapper } from './RewardsListsEmptyStyles';

export const RewardsListsUnsupportedChain: FC = () => {
  const {
    config: { supportedChains },
  } = useConfig();

  const supportedChainsNames = useMemo(() => {
    // 'Chain ID' array to 'Chain name' array exclude unknown chain id
    const chains = supportedChains.map((id) => CHAINS[id]).filter(Boolean);
    const lastChain = chains.pop();
    return [chains.join(', '), lastChain].filter((chain) => chain).join(' or ');
  }, [supportedChains]);

  return (
    <>
      <Divider indents="lg" />
      <RewardsListEmptyWrapper>
        <p>
          Please switch to {supportedChainsNames} in your wallet and restart the
          page.
        </p>
      </RewardsListEmptyWrapper>
    </>
  );
};
