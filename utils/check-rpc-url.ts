import { ethers } from 'ethers';
import { CHAINS } from '@lido-sdk/constants';
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
    const rpcProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const network = await rpcProvider.getNetwork();
    if (network.chainId !== chainId) {
      return RPCErrorType.NETWORK_DOES_NOT_MATCH;
    }

    // Doing a random request to check rpc url is fetchable
    // TODO...

    // All fine
    return true;
  } catch (err) {
    return RPCErrorType.URL_IS_NOT_WORKING;
  }
};
