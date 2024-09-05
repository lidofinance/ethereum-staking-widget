import { createClient, http } from 'viem';
import { getChainId } from 'viem/actions';

// Safely initialize a global variable
let globalRPCCheckResults = globalThis.__rpcCheckResults || [];
globalThis.__rpcCheckResults = globalRPCCheckResults;

export const BROKEN_URL = 'BROKEN_URL';
export const RPC_TIMEOUT_MS = 10_000;
export const MAX_RETRY_COUNT = 3;
export const RETRY_WAIT_TIME_MS = 30_000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pushRPCCheckResult = (domain, success) => {
  globalRPCCheckResults.push({ domain, success });
};

export const getRPCCheckResults = () => globalThis.__rpcCheckResults || [];

const getRpcUrls = (chainId) => {
  const rpcUrls = process.env[`EL_RPC_URLS_${chainId}`]?.split(',');
  return rpcUrls?.filter((url) => url);
};

const checkRPCWithRetries = async (url, defaultChain) => {
  let domain;
  try {
    domain = new URL(url).hostname;
  } catch (err) {
    console.error('There is a broken URL.');
    pushRPCCheckResult(BROKEN_URL, false);
    return false;
  }

  for (let attempt = 1; attempt <= MAX_RETRY_COUNT; attempt++) {
    try {
      console.info(`[startupCheckRPCs] Attempt ${attempt} for RPC ${domain}.`);

      const client = createClient({
        transport: http(url, { retryCount: 0, timeout: RPC_TIMEOUT_MS }),
      });

      const chainId = await getChainId(client);

      if (defaultChain === chainId) {
        pushRPCCheckResult(domain, true);
        console.info(`[startupCheckRPCs] RPC ${domain} works!`);
        return true;
      } else {
        throw new Error(`[startupCheckRPCs] RPC ${domain} returned chainId ${chainId}, expected ${defaultChain}.`);
      }
    } catch (err) {
      console.error(`[startupCheckRPCs] Error on attempt ${attempt} with RPC ${domain}:`);
      console.error(String(err).replaceAll(url, domain));

      if (attempt === MAX_RETRY_COUNT) {
        console.error(`[startupCheckRPCs] Failed after ${MAX_RETRY_COUNT} attempts.`);
        pushRPCCheckResult(domain, false);
      } else {
        console.info(`[startupCheckRPCs] Waiting for ${RETRY_WAIT_TIME_MS} ms before retrying...`);
        await sleep(RETRY_WAIT_TIME_MS);
      }
    }
  }

  return false;
};

export const startupCheckRPCs = async () => {
  console.info('[startupCheckRPCs] Starting...');

  try {
    const defaultChain = parseInt(process.env.DEFAULT_CHAIN, 10);
    const rpcUrls = getRpcUrls(defaultChain);

    if (!rpcUrls || rpcUrls.length === 0) {
      throw new Error('[startupCheckRPCs] No RPC URLs found!');
    }

    let brokenRPCCount = 0;

    for (const url of rpcUrls) {
      const success = await checkRPCWithRetries(url, defaultChain);

      if (!success) {
        brokenRPCCount += 1;
      }
    }

    if (brokenRPCCount > 0) {
      console.info(`[startupCheckRPCs] Number of working RPCs: ${rpcUrls.length - brokenRPCCount}`);
      console.info(`[startupCheckRPCs] Number of broken RPCs: ${brokenRPCCount}`);
    } else {
      console.info('[startupCheckRPCs] All RPC works!');
    }
  } catch (err) {
    console.error('[startupCheckRPCs] Error during startup check:');
    console.error(err);
  }
};
