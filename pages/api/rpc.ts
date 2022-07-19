import getConfig from 'next/config';
import { registry } from 'utilsApi/metrics';
import { rpcFactory } from '@lidofinance/widget-blocks';
import { METRICS_PREFIX } from '../../config';
import { fetchRPC, serverLogger } from 'utilsApi';
import { providers } from '../../utilsApi/providers';

const { publicRuntimeConfig } = getConfig();
const { defaultChain } = publicRuntimeConfig;

const rpc = rpcFactory({
  fetchRPC,
  serverLogger,
  metrics: {
    prefix: METRICS_PREFIX,
    registry,
  },
  allowedRPCMethods: [
    'eth_call',
    'eth_gasPrice',
    'eth_estimateGas',
    'eth_getBlockByNumber',
  ],
  defaultChain,
  providers,
});

export default rpc;
