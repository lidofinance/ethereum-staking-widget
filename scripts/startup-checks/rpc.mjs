import { createClient, http } from 'viem';
import { getChainId } from 'viem/actions';

export const BROKEN_URL = 'BROKEN_URL';
export const RPC_TIMEOUT_MS = 10_000;
export const MAX_RETRY_COUNT = 3;
export const RETRY_WAIT_TIME_MS = 10_000;

// Safely initialize a global variable
const globalStartupRPCChecks = globalThis.__startupRPCChecks || {
  promise: null,
  // A 'item of results' is obj '{ domain, chainId, success }'
  results: [],
};
globalThis.__startupRPCChecks = globalStartupRPCChecks;

// Utility
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Utility
const timeoutPromise = (ms, message) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));

const getRPCUrls = (chainId) => {
  const rpcUrls = process.env[`EL_RPC_URLS_${chainId}`]?.split(',');
  return rpcUrls?.filter((url) => url);
};

const pushRPCCheckResult = (domain, chainId, success) => {
  globalStartupRPCChecks.results.push({ domain, chainId, success });
};

const checkRPC = async (url, chainId) => {
  let domain;
  try {
    domain = new URL(url).hostname;
  } catch {
    console.error(`[checkRPC] Invalid URL: ${url}`);
    pushRPCCheckResult(BROKEN_URL, chainId, false);
    return false;
  }

  try {
    const client = createClient({
      transport: http(url, { retryCount: 0, timeout: RPC_TIMEOUT_MS }),
    });

    const chainIdClient = await getChainId(client);

    if (chainIdClient === chainId) {
      pushRPCCheckResult(domain, chainId, true);
      console.info(`[checkRPC] RPC ${domain} is working`);
      return true;
    } else {
      throw new Error(`[checkRPC] Expected chainId ${chainId}, but got ${chainId}`);
    }
  } catch (err) {
    console.error(`[checkRPC] Error checking RPC ${domain}: ${err.message}`);
    return false;
  }
};

const checkRPCWithRetries = async (url, chainId) => {
  const domain = new URL(url).hostname;

  for (let attempt = 1; attempt <= MAX_RETRY_COUNT; attempt++) {
    try {
      console.info(`[checkRPCWithRetries] Attempt ${attempt} for RPC ${domain}`);

      const result = await Promise.race([
        checkRPC(url, chainId),
        timeoutPromise(RPC_TIMEOUT_MS, `[checkRPCWithRetries] RPC ${domain} timed out`),
      ]);

      if (!result) {
        throw new Error('[checkRPCWithRetries] Promise(checkRPC) returned false!');
      }

      // Stop checking for ${url} with success (a success is set in the 'checkRPC' function)
      return true;
    } catch (err) {
      console.error(`[checkRPCWithRetries] Error on attempt ${attempt} for RPC ${domain}: ${err.message}`);

      if (attempt === MAX_RETRY_COUNT) {
        console.error(`[checkRPCWithRetries] Failed after ${MAX_RETRY_COUNT} attempts for ${domain}`);
        pushRPCCheckResult(domain, chainId, false);
      } else {
        console.info(`[checkRPCWithRetries] Retrying in ${RETRY_WAIT_TIME_MS} ms...`);
        await sleep(RETRY_WAIT_TIME_MS);
      }
    }
  }

  return false;
};

export const getRPCChecks = () => globalStartupRPCChecks.promise;

export const startupCheckRPCs = async () => {
  console.info('[startupCheckRPCs] Starting RPC checks...');

  if (globalStartupRPCChecks.promise) {
    return globalStartupRPCChecks.promise;
  }

  globalStartupRPCChecks.promise = (async () => {
    try {
      const supportedChains = process.env?.SUPPORTED_CHAINS?.split(',').map(
        (chainId) => parseInt(chainId, 10)
      ) ?? [process.env.DEFAULT_CHAIN];

      if (!supportedChains.length) {
        throw new Error('[startupCheckRPCs] No supported chains found!');
      }

      for (const chainId of supportedChains) {
        const rpcUrls = getRPCUrls(chainId);

        if (!rpcUrls?.length) {
          throw new Error(`[startupCheckRPCs] No RPC URLs found for chain ${chainId}`);
        }

        const chainCheckResults = await Promise.all(
          rpcUrls.map((url) => checkRPCWithRetries(url, chainId))
        );
        const brokenRPCCount = chainCheckResults.filter((success) => !success).length;

        console.info(`[startupCheckRPCs] [chainId=${chainId}] Working RPCs: ${chainCheckResults.length - brokenRPCCount}`);
        console.info(`[startupCheckRPCs] [chainId=${chainId}] Broken RPCs: ${brokenRPCCount}`);
      }

      return globalStartupRPCChecks.results;
    } catch (err) {
      console.error('[startupCheckRPCs] Error during RPC checks:', err);
      return null;
    }
  })();
};
