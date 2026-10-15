import { CowswapDex } from 'shared/dexes/cowswap';
import { useRefetchBalances } from 'features/dex-withdrawals/cowswap';

import { SWAP_COWSWAP_PROFILE } from './cowswap';
import { SwapBlock } from './styles';

export const SwapDex = () => {
  const refetchBalances = useRefetchBalances();

  return (
    <SwapBlock data-testid="swapForm">
      <CowswapDex
        profile={SWAP_COWSWAP_PROFILE}
        refetchBalances={refetchBalances}
        consumeBottomSpace={false}
      />
    </SwapBlock>
  );
};
