import { ethers } from 'ethers';
import { CHAINS, getTokenAddress, TOKENS } from '@lido-sdk/constants';
import { StethAbiFactory } from '@lido-sdk/contracts';

import { isUrl } from './is-url';

export enum RPCErrorType {
  URL_IS_NOT_VALID = 'URL_IS_NOT_VALID',
  URL_IS_NOT_WORKING = 'URL_IS_NOT_WORKING',
  NETWORK_DOES_NOT_MATCH = 'NETWORK_DOES_NOT_MATCH',
}

export const checkRpcUrl = async (rpcUrl: string, chainId: CHAINS) => {
  if (!isUrl(rpcUrl)) return RPCErrorType.URL_IS_NOT_VALID;
  try {
    // Check chain id
    const rpcProvider = new ethers.providers.JsonRpcProvider({
      url: rpcUrl,
      throttleLimit: 1, // prevents retries for 429 status
    });
    const network = await rpcProvider.getNetwork();
    if (network.chainId !== chainId) {
      return RPCErrorType.NETWORK_DOES_NOT_MATCH;
    }

    // Doing a request to check rpc url is fetchable
    const stethAddress = getTokenAddress(chainId, TOKENS.STETH);
    const stethContract = StethAbiFactory.connect(stethAddress, rpcProvider);
    await stethContract.name();

    // All fine
    return true;
  } catch (err) {
    return RPCErrorType.URL_IS_NOT_WORKING;
  }
};
