import getConfig from 'next/config';
import rpcFetch from 'features/rewards/fetchers/rpcFetch';

import { constants } from 'ethers';
import type { BigNumber as EthersBigNumber } from 'ethers';

const { publicRuntimeConfig } = getConfig();
const { defaultChain } = publicRuntimeConfig;

const MAINNET_CURVE = '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022';

/**
Return dynamic price only on mainnet
For testnet simply provide 1-1 ratio for UI to work
**/

export const stEthEthRequest = () =>
  parseInt(defaultChain) === 1
    ? rpcFetch<EthersBigNumber>(MAINNET_CURVE, 'get_dy', 0, 1, String(10 ** 18))
    : constants.WeiPerEther;
