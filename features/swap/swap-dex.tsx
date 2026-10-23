import { LIDO_MULTICHAIN_CHAINS } from 'consts/chains';
import { useDappStatus } from 'modules/web3';
import { CowswapDex } from 'modules/dexes/cowswap';
import { useRefetchBalances } from 'features/dex-withdrawals/cowswap';

import { SWAP_COWSWAP_PROFILE } from './cowswap';
import { useSwapChainIds } from './hooks';
import { SWAP_CARD_MAX_WIDTH, SwapBlock, SwapFallback } from './styles';

export const SwapDex = () => {
  const refetchBalances = useRefetchBalances();
  const chainIds = useSwapChainIds();
  const { walletChainId } = useDappStatus();
  const chainName = walletChainId && LIDO_MULTICHAIN_CHAINS[walletChainId];

  return (
    <SwapBlock data-testid="swapForm">
      <SwapFallback
        toActionText="to swap"
        multichainMessage={
          <>
            Swap isn&apos;t available on {chainName}.
            <br />
            Please switch to a supported network.
          </>
        }
      />
      <CowswapDex
        profile={SWAP_COWSWAP_PROFILE}
        refetchBalances={refetchBalances}
        chainIds={chainIds}
        consumeBottomSpace={false}
        loaderMaxWidth={SWAP_CARD_MAX_WIDTH}
      />
    </SwapBlock>
  );
};
