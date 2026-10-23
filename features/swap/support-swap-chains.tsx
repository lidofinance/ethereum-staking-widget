import type { FC, PropsWithChildren } from 'react';

import { SupportL1AndCustomL2Chains } from 'modules/web3';

import { useSwapChainIds } from './hooks';

// L1 and the swap L2s that the manifest has not turned off
export const SupportL1AndSwapL2Chains: FC<PropsWithChildren> = ({
  children,
}) => {
  const chainIds = useSwapChainIds();
  return (
    <SupportL1AndCustomL2Chains l2ChainIds={chainIds}>
      {children}
    </SupportL1AndCustomL2Chains>
  );
};
