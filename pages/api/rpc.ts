import getConfig from 'next/config';
import { registry } from 'utilsApi/metrics';
import { rpcFactory } from '../../backend-blocks/pages';
import { METRICS_PREFIX } from '../../config';
import { fetchRPC, serverLogger } from 'utilsApi';

const { publicRuntimeConfig } = getConfig();
const { defaultChain } = publicRuntimeConfig;

const rpc = rpcFactory({
  metrics: {
    prefix: METRICS_PREFIX,
    registry,
  },
  defaultChain,
  allowedRPCMethods: [
    'eth_call',
    'eth_gasPrice',
    'eth_estimateGas',
    'eth_getBlockByNumber',
  ],
  fetchRPC,
  serverLogger,
});

export default rpc;
