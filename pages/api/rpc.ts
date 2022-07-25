import getConfig from 'next/config';
import { registry } from 'utilsApi/metrics';
import { rpcFactory } from '@lidofinance/next-pages';
import { METRICS_PREFIX } from 'config';
import { fetchRPC, serverLogger } from 'utilsApi';
import { rpcUrls } from 'utilsApi/rpcUrls';

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
  providers: rpcUrls,
});

export default rpc;
