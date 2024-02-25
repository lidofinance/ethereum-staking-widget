import { constants } from 'ethers';
import type { BigNumber as EthersBigNumber } from 'ethers';
import { StaticJsonRpcBatchProvider } from '@lidofinance/eth-providers';

import { getConfig } from 'config';
const { defaultChain } = getConfig();

import rpcFetch from 'features/rewards/fetchers/rpcFetch';

const MAINNET_CURVE = '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022';

/**
Return dynamic price only on mainnet
For testnet simply provide 1-1 ratio for UI to work
**/

export const stEthEthRequest = (mainnetProvider: StaticJsonRpcBatchProvider) =>
  defaultChain === 1
    ? rpcFetch<EthersBigNumber>(
        mainnetProvider,
        MAINNET_CURVE,
        'get_dy',
        0,
        1,
        String(10 ** 18),
      )
    : constants.WeiPerEther;
