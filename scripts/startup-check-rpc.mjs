import { ethers } from 'ethers';

export const getRpcUrl = (chainId) => {
  const rpcUrls = process.env[`EL_RPC_URLS_${chainId}`]?.split(',');
  return rpcUrls?.[0];
};

export const startupCheckRPC = async () => {
  try {
    const defaultChain = parseInt(process.env.DEFAULT_CHAIN, 10);
    const rpcUrl = getRpcUrl(defaultChain);

    if (!rpcUrl) {
      throw new Error('[startupCheckRPC] RPC URL not found or is empty!');
    }

    const rpcProvider = new ethers.providers.JsonRpcProvider({
      url: rpcUrl,
      throttleLimit: 1, // prevents retries for 429 status
    });

    const network = await rpcProvider.getNetwork();
    if (defaultChain !== network.chainId) {
      console.debug('[startupCheckRPC] RPC getNetwork response:');
      console.debug(network);
      throw new Error('[startupCheckRPC] Chain IDs do not match!');
    }

    console.debug('[startupCheckRPC] OK!');
  } catch (err) {
    console.error('[startupCheckRPC] Error during startup check:');
    console.error(err);
    // Exit with a failure code
    process.exit(1);
  }
};
