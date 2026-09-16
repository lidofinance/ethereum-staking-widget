import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';
import { toFunctionSelector } from 'viem';

// One recognized contract with a one-function ABI. Mocked so the test does not
// pull in `config/` through the real metrics map.
const KNOWN_TO = '0x0000000000000000000000000000000000000002';
const ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

vi.mock('../contractAddressesMetricsMap', () => ({
  METRIC_CONTRACT_ADDRESSES: {
    [1]: { '0x0000000000000000000000000000000000000002': 'testContract' },
  },
  getMetricContractAbi: () => ABI,
}));

import { collectRequestAddressMetric } from '../collect-request-address-metric';

const makeEthCall = (data: string) => ({
  jsonrpc: '2.0',
  id: 1,
  method: 'eth_call',
  params: [{ to: KNOWN_TO, data }, 'latest'],
});

const makeCounterMock = () => {
  const recorded: Record<string, string>[] = [];
  const counter: any = {
    labels: (labels: Record<string, string>) => ({
      inc: () => recorded.push(labels),
    }),
  };
  return { counter, recorded };
};

// RPC-METRIC-ATTRIBUTION-01: a recognized address must not let arbitrary
// selectors create unbounded label series
describe('collectRequestAddressMetric on a recognized contract', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => vi.restoreAllMocks());

  it('keeps the raw selector when it decodes against the ABI', async () => {
    const selector = toFunctionSelector(ABI[0]);
    const { counter, recorded } = makeCounterMock();
    await collectRequestAddressMetric({
      calls: [makeEthCall(selector)],
      chainId: CHAINS.Mainnet,
      metrics: counter,
    });
    expect(recorded[0]).toMatchObject({
      address: KNOWN_TO,
      contractName: 'testContract',
      methodEncoded: selector,
      methodDecoded: 'balanceOf',
    });
  });

  it('collapses every unknown selector into a single series', async () => {
    const { counter, recorded } = makeCounterMock();
    const calls = Array.from({ length: 1000 }, (_, i) =>
      makeEthCall(`0x${i.toString(16).padStart(8, '0')}`),
    );
    await collectRequestAddressMetric({
      calls,
      chainId: CHAINS.Mainnet,
      metrics: counter,
    });
    const series = new Set(recorded.map((labels) => JSON.stringify(labels)));
    expect(recorded.length).toBe(1000);
    expect(series.size).toBe(1);
    expect(recorded[0]).toMatchObject({
      address: KNOWN_TO,
      contractName: 'testContract',
      methodEncoded: 'unknown',
      methodDecoded: 'unknown',
    });
  });
});
