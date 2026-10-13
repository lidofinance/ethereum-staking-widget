import { Block } from '@lidofinance/lido-ui';

import { CowswapDex } from 'shared/dexes/cowswap';
import { useRefetchBalances } from 'features/dex-withdrawals/cowswap';

import { SWAP_COWSWAP_PROFILE } from './cowswap';

export const SwapDex = () => {
  const refetchBalances = useRefetchBalances();

  return (
    <Block data-testid="swapForm">
      <CowswapDex
        profile={SWAP_COWSWAP_PROFILE}
        refetchBalances={refetchBalances}
      />
    </Block>
  );
};
