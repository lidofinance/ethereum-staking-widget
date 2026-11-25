// Reported in place of a chain id when no wallet is connected
export const DISCONNECTED_CHAIN_ID = 0;

// The connected wallet's chain, kept up to date by the Web3 provider so that
// plain functions (analytics) can read it without a hook
let trackedChain: number = DISCONNECTED_CHAIN_ID;

export const setTrackedChain = (chainId?: number) => {
  trackedChain = chainId ?? DISCONNECTED_CHAIN_ID;
};

export const getTrackedChain = () => trackedChain;
