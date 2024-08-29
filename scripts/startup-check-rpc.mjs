import { ethers } from 'ethers';

export const getRpcUrls = (chainId) => {
  const rpcUrls = process.env[`EL_RPC_URLS_${chainId}`]?.split(',');
  return rpcUrls?.filter((url) => url);
};

export const startupCheckRPC = async () => {
  console.info('[startupCheckRPC] Start check.');

  try {
    const defaultChain = parseInt(process.env.DEFAULT_CHAIN, 10);
    const rpcUrls = getRpcUrls(defaultChain);

    if (!rpcUrls || rpcUrls.length === 0) {
      throw new Error('[startupCheckRPC] No RPC URLs found!');
    }

    let errorCount = 0;

    for (const url of rpcUrls) {
      let domain;
      try {
        domain = new URL(url).hostname;
      } catch (err) {
        errorCount += 1;
        console.error('There is a broken URL.');
        continue;
      }

      try {
        const rpcProvider = new ethers.providers.JsonRpcProvider({
          url: url,
          throttleLimit: 1, // prevents retries for 429 status
        });

        const network = await rpcProvider.getNetwork();
        if (defaultChain === network.chainId) {
          console.info(`[startupCheckRPC] RPC ${domain} works!`);
        } else {
          errorCount += 1;
          console.error(`[startupCheckRPC] RPC ${domain} does not work! RPC getNetwork response:`);
          console.error(network);
        }
      } catch (err) {
        errorCount += 1;
        console.error(`[startupCheckRPC] Error with RPC ${domain}:`);
        console.error(err);
      }
    }

    if (errorCount > 0) {
      console.info(`[startupCheckRPC] Number of working RPCs - ${rpcUrls.length - errorCount}`);
      console.info(`[startupCheckRPC] Number of broken RPCs - ${errorCount}`);
      throw new Error('[startupCheckRPC] Broken RPCs found!');
    }

    console.info('[startupCheckRPC] All RPC works!');
  } catch (err) {
    console.error('[startupCheckRPC] Error during startup check:');
    console.error(err);
    // Exit with a failure code
    process.exit(1);
  }
};

