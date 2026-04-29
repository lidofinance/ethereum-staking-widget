import { trackedFetchRpcFactory } from '@lidofinance/api-rpc';
import {
  CHAINS,
  LIDO_L2_CONTRACT_ADDRESSES,
} from '@lidofinance/lido-ethereum-sdk/common';
import { rpcFactory } from '@lidofinance/next-pages';

import { FastifyInstance } from 'fastify';
import holeskySet from '../../../networks/holesky.json' assert { type: 'json' };
import hoodiDevnet0Set from '../../../networks/hoodi-devnet-0.json' assert { type: 'json' };
import hoodiDevnet1Set from '../../../networks/hoodi-devnet-1.json' assert { type: 'json' };
import hoodiSet from '../../../networks/hoodi.json' assert { type: 'json' };

import mainnetSet from '../../../networks/mainnet.json' assert { type: 'json' };
import sepoliaSet from '../../../networks/sepolia.json' assert { type: 'json' };
import { HttpMethod, httpMethodGuard } from './http-method-guard.js';
import Metrics, { METRICS_PREFIX } from './metrics.js';

export const CONTRACT_NAMES = {
  lido: 'lido',
  wsteth: 'wsteth',
  withdrawalQueue: 'withdrawalQueue',
  dualGovernance: 'dualGovernance',
  escrow: 'escrow',
  emergencyProtectedTimelock: 'emergencyProtectedTimelock',
  dgConfigProvider: 'dgConfigProvider',
  L2stETH: 'L2stETH',
  L2wstETH: 'L2wstETH',
  aggregatorEthUsdPriceFeed: 'aggregatorEthUsdPriceFeed',
  aggregatorStEthUsdPriceFeed: 'aggregatorStEthUsdPriceFeed',
  stakingRouter: 'stakingRouter',
  stethCurve: 'stethCurve',
  lidoLocator: 'lidoLocator',
  ensPublicResolver: 'ensPublicResolver',
  ensRegistry: 'ensRegistry',
  weth: 'weth',
  ggvVault: 'ggvVault',
  ggvTeller: 'ggvTeller',
  ggvAccountant: 'ggvAccountant',
  ggvLens: 'ggvLens',
  ggvQueue: 'ggvQueue',
  dvvVault: 'dvvVault',
  dvvDepositWrapper: 'dvvDepositWrapper',
  stgVault: 'stgVault',
  stgDepositQueueETH: 'stgDepositQueueETH',
  stgDepositQueueWETH: 'stgDepositQueueWETH',
  stgDepositQueueWSTETH: 'stgDepositQueueWSTETH',
  stgRedeemQueueWSTETH: 'stgRedeemQueueWSTETH',
  stgShareManagerSTRETH: 'stgShareManagerSTRETH',
  stgCollector: 'stgCollector',
};

type NetworkConfig = {
  contracts?: Record<string, string>;
};

const DEVNETS_MAP: Record<string, NetworkConfig> = {
  'hoodi-devnet-0': hoodiDevnet0Set,
  'hoodi-devnet-1': hoodiDevnet1Set,
};

const NETWORKS_MAP: Record<number, NetworkConfig> = {
  [CHAINS.Mainnet]: mainnetSet,
  [CHAINS.Holesky]: holeskySet,
  [CHAINS.Hoodi]: hoodiSet,
  [CHAINS.Sepolia]: sepoliaSet,
};

const CONTRACTS_WITH_EVENTS = [
  CONTRACT_NAMES.withdrawalQueue,
  CONTRACT_NAMES.lido,
  CONTRACT_NAMES.wsteth,
  CONTRACT_NAMES.L2stETH,
  CONTRACT_NAMES.L2wstETH,
  CONTRACT_NAMES.weth,
  CONTRACT_NAMES.dvvVault,
  CONTRACT_NAMES.ggvVault,
  CONTRACT_NAMES.stgShareManagerSTRETH,
];

const parseList = (value: string | undefined) =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const parseChainList = (value: string | undefined, fallback: number[]) => {
  const list = parseList(value)
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0);
  return list.length > 0 ? list : fallback;
};

export const DEFAULT_CHAIN =
  Number.parseInt(process.env.DEFAULT_CHAIN ?? '', 10) || CHAINS.Hoodi;

export const SUPPORTED_CHAINS = parseChainList(process.env.SUPPORTED_CHAINS, [
  DEFAULT_CHAIN,
]);

const DEVNET_OVERRIDES = parseList(process.env.DEVNET_OVERRIDES)
  .map((item) => item.split(':'))
  .reduce<Record<number, string>>((acc, [chainId, setName]) => {
    const id = Number(chainId);
    if (Number.isFinite(id) && setName) {
      acc[id] = setName;
    }
    return acc;
  }, {});

const getNetworkConfigByChain = (chainId: number) => {
  const override = DEVNET_OVERRIDES[chainId];
  if (override && DEVNETS_MAP[override]) {
    return DEVNETS_MAP[override];
  }
  return NETWORKS_MAP[chainId];
};

const l2Addresses = LIDO_L2_CONTRACT_ADDRESSES as Record<
  number,
  { steth?: string; wsteth?: string }
>;

const getContractAddress = (chainId: number, contractName: string) => {
  if (l2Addresses[chainId]) {
    if (contractName === CONTRACT_NAMES.L2stETH) {
      return l2Addresses[chainId]?.steth;
    }
    if (contractName === CONTRACT_NAMES.L2wstETH) {
      return l2Addresses[chainId]?.wsteth;
    }
  }
  const network = getNetworkConfigByChain(chainId);
  return network?.contracts?.[contractName];
};

const invertContractsNamesToAddress = (
  contractNames: string[],
  chainId: number,
) =>
  contractNames.reduce<Record<string, string>>((acc, contractName) => {
    const address = getContractAddress(chainId, contractName);
    if (address) {
      acc[address] = contractName;
    }
    return acc;
  }, {});

const supportedChainsWithMainnet = Array.from(
  new Set(
    SUPPORTED_CHAINS.includes(CHAINS.Mainnet)
      ? SUPPORTED_CHAINS
      : [...SUPPORTED_CHAINS, CHAINS.Mainnet],
  ),
);

export const METRIC_CONTRACT_ADDRESSES = supportedChainsWithMainnet.reduce<
  Record<number, Record<string, string>>
>(
  (mapped, chainId) => ({
    ...mapped,
    [chainId]: invertContractsNamesToAddress(
      Object.values(CONTRACT_NAMES),
      chainId,
    ),
  }),
  {},
);

export const METRIC_CONTRACT_EVENT_ADDRESSES =
  supportedChainsWithMainnet.reduce<Record<number, Record<string, string>>>(
    (mapped, chainId) => ({
      ...mapped,
      [chainId]: invertContractsNamesToAddress(CONTRACTS_WITH_EVENTS, chainId),
    }),
    {},
  );

export const RPC_PROVIDERS = SUPPORTED_CHAINS.reduce<
  Record<number, [string, ...string[]]>
>((acc, chainId) => {
  const envKey = `EL_RPC_URLS_${chainId}`;
  const urls = parseList(process.env[envKey]);
  if (urls.length > 0) {
    acc[chainId] = urls as [string, ...string[]];
  }
  return acc;
}, {});

const metricContractAddresses = METRIC_CONTRACT_ADDRESSES as Record<
  string,
  Record<string, string>
>;
const metricContractEventAddresses = METRIC_CONTRACT_EVENT_ADDRESSES as Record<
  string,
  Record<string, string>
>;

const allowedCallAddresses = Object.entries(metricContractAddresses).reduce<
  Record<string, string[]>
>((acc, [chainId, addresses]) => {
  acc[chainId] = Object.keys(addresses);
  return acc;
}, {});

const allowedLogsAddresses = Object.entries(
  metricContractEventAddresses,
).reduce<Record<string, string[]>>((acc, [chainId, addresses]) => {
  acc[chainId] = Object.keys(addresses);
  return acc;
}, {});

const rpc = rpcFactory({
  fetchRPC: trackedFetchRpcFactory({
    registry: Metrics.registry,
    prefix: METRICS_PREFIX,
  }),
  metrics: {
    prefix: METRICS_PREFIX,
    registry: Metrics.registry,
  },
  defaultChain: String(DEFAULT_CHAIN),
  providers: RPC_PROVIDERS,
  validation: {
    allowedRPCMethods: [
      'test',
      'eth_call',
      'eth_gasPrice',
      'eth_getCode',
      'eth_estimateGas',
      'eth_getBlockByNumber',
      'eth_feeHistory',
      'eth_maxPriorityFeePerGas',
      'eth_getBalance',
      'eth_blockNumber',
      'eth_getTransactionByHash',
      'eth_getTransactionReceipt',
      'eth_getTransactionCount',
      'eth_sendRawTransaction',
      'eth_getLogs',
      'eth_chainId',
      'net_version',
    ],
    allowedCallAddresses,
    allowedLogsAddresses,
    maxBatchCount: 20,
    blockEmptyAddressGetLogs: true,
    maxGetLogsRange: 20_000,
    maxResponseSize: 1_000_000,
  },
});

export const registerRpcRoute = (app: FastifyInstance) => {
  app.route({
    method: ['POST', 'OPTIONS'],
    url: '/api/rpc',
    handler: async (request, reply) => {
      if (await httpMethodGuard([HttpMethod.POST])(request, reply)) {
        return;
      }

      await reply.hijack();

      const req = Object.assign(request.raw, {
        method: request.method,
        query: request.query ?? {},
        body: request.body,
        headers: request.headers,
      });

      const res = reply.raw as typeof reply.raw & {
        status: (code: number) => typeof reply.raw;
        json: (payload: unknown) => typeof reply.raw;
      };
      res.status = (code: number) => {
        res.statusCode = code;
        return res;
      };
      res.json = (payload: unknown) => {
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'application/json');
        }
        res.end(JSON.stringify(payload));
        return res;
      };

      await rpc(req as any, res as any);
    },
  });
};
