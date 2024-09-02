import { ethers } from 'ethers';

// Safely initialize a global variable
let globalRPCCheckResults = globalThis.__rpcCheckResults || [];
globalThis.__rpcCheckResults = globalRPCCheckResults;

export const BROKEN_URL = 'BROKEN_URL';
export const DELAY_TO_STOP_SECONDS = 30_000;

const pushRPCCheckResult = (domain, success) => {
  globalRPCCheckResults.push({ domain, success });
};

export const getRPCCheckResults = () => globalThis.__rpcCheckResults || [];

const getRpcUrls = (chainId) => {
  const rpcUrls = process.env[`EL_RPC_URLS_${chainId}`]?.split(',');
  return rpcUrls?.filter((url) => url);
};

export const startupCheckRPCs = async () => {
  console.info('[startupCheckRPCs] Starting...');

  try {
    const defaultChain = parseInt(process.env.DEFAULT_CHAIN, 10);
    const rpcUrls = getRpcUrls(defaultChain);

    if (!rpcUrls || rpcUrls.length === 0) {
      throw new Error('[startupCheckRPCs] No RPC URLs found!');
    }

    let errorCount = 0;

    for (const url of rpcUrls) {
      let domain;
      try {
        domain = new URL(url).hostname;
      } catch (err) {
        errorCount += 1;
        console.error('There is a broken URL.');
        pushRPCCheckResult(BROKEN_URL, false);
        continue;
      }

      try {
        const rpcProvider = new ethers.providers.JsonRpcProvider({
          url: url,
          throttleLimit: 1,
        });

        const network = await rpcProvider.getNetwork();
        if (defaultChain === network.chainId) {
          console.info(`[startupCheckRPCs] RPC ${domain} works!`);
          pushRPCCheckResult(domain, true);
        } else {
          errorCount += 1;
          console.error(`[startupCheckRPCs] RPC ${domain} does not work! RPC getNetwork response:`);
          pushRPCCheckResult(domain, false);
          console.error(network);
        }
      } catch (err) {
        errorCount += 1;
        console.error(`[startupCheckRPCs] Error with RPC ${domain}:`);
        pushRPCCheckResult(domain, false);
        console.error(err);
      }
    }

    if (errorCount > 0) {
      console.info(`[startupCheckRPCs] Number of working RPCs - ${rpcUrls.length - errorCount}`);
      console.info(`[startupCheckRPCs] Number of broken RPCs - ${errorCount}`);
      console.error('[startupCheckRPCs] Broken RPCs found! Stopping the app in 30 seconds...');

      setTimeout(() => {
        console.error('[startupCheckRPCs] Stop the app!');
        process.exit(1);
      }, DELAY_TO_STOP_SECONDS);
    } else {
      console.info('[startupCheckRPCs] All RPC works!');
    }
  } catch (err) {
    console.error('[startupCheckRPCs] Error during startup check:');
    console.error(err);
    console.error('[startupCheckRPCs] Stopping the app in 30 seconds...');

    setTimeout(() => {
      console.error('[startupCheckRPCs] Stop the app!');
      process.exit(1);
    }, DELAY_TO_STOP_SECONDS);
  }
};
