import { createClient, http } from 'viem';
import { getChainId } from 'viem/actions';

export const BROKEN_URL = 'BROKEN_URL';
export const RPC_TIMEOUT_MS = 10_000;
export const MAX_RETRY_COUNT = 3;

// Safely initialize a global variable
const globalStartupRPCChecks = globalThis.__startupRPCChecks || {
  promise: null,
};
globalThis.__startupRPCChecks = globalStartupRPCChecks;

const getRPCUrls = (chainId) => {
  const rpcUrls = process.env[`EL_RPC_URLS_${chainId}`]?.split(',');
  return rpcUrls?.filter((url) => url);
};

const checkRPC = async (url, chainId) => {
  let domain;
  try {
    domain = new URL(url).hostname;
  } catch {
    console.error(`[checkRPC] Invalid URL: ${url}`);
    return { domain: BROKEN_URL, chainId, success: false };
  }

  try {
    const client = createClient({
      transport: http(url, {
        retryCount: MAX_RETRY_COUNT,
        timeout: RPC_TIMEOUT_MS,
      }),
    });

    const chainIdClient = await getChainId(client);

    if (chainIdClient === chainId) {
      console.info(`[checkRPC] [chainId=${chainId}] RPC ${domain} is working`);
      return { domain, chainId, success: true };
    } else {
      throw new Error(`Expected chainId ${chainId}, but got ${chainIdClient}`);
    }
  } catch (err) {
    console.error(
      `[checkRPC] [chainId=${chainId}] Error checking RPC ${domain}: ${err.message}`,
    );
    return { domain, chainId, success: false };
  }
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
        (chainId) => parseInt(chainId, 10),
      ) ?? [process.env.DEFAULT_CHAIN];

      if (supportedChains.length === 0) {
        throw new Error('[startupCheckRPCs] No supported chains found!');
      }

      const results = [];

      for (const chainId of supportedChains) {
        const rpcUrls = getRPCUrls(chainId);
        if (!rpcUrls?.length) {
          throw new Error(
            `[startupCheckRPCs] [chainId=${chainId}] No RPC URLs found!`,
          );
        }

        const chainCheckResults = await Promise.all(
          rpcUrls.map((url) => checkRPC(url, chainId)),
        );
        results.push(...chainCheckResults);

        const brokenRPCCount = chainCheckResults.filter(
          (result) => !result.success,
        ).length;
        console.info(
          `[startupCheckRPCs] [chainId=${chainId}] Working/Total RPCs: ${chainCheckResults.length - brokenRPCCount}/${chainCheckResults.length}`,
        );
      }

      return results;
    } catch (err) {
      console.error('[startupCheckRPCs] Error during RPC checks:', err);
      return null;
    }
  })();
};
