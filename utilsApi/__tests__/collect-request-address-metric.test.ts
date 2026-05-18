import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';

// Empty map → tests cover the unknown-contract path. Mock also avoids
// pulling in `config/` which transitively imports `env-dynamics.mjs`.
jest.mock('../contractAddressesMetricsMap', () => ({
  METRIC_CONTRACT_ADDRESSES: {},
  getMetricContractAbi: () => null,
}));

import { collectRequestAddressMetric } from '../collect-request-address-metric';

const VALID_UNKNOWN_TO = '0x0000000000000000000000000000000000000001';
const ETH_CALL_SELECTOR = '0xaabbccdd';

const makeEthCall = (to: string, data: string = ETH_CALL_SELECTOR) => ({
  jsonrpc: '2.0',
  id: 1,
  method: 'eth_call',
  params: [{ to, data }, 'latest'],
});

type LabelArgs = Record<string, string>;

const makeCounterMock = () => {
  const recorded: LabelArgs[] = [];
  const counter: any = {
    labels(labels: LabelArgs) {
      return {
        inc: (n: number) => {
          recorded.push({ ...labels, __inc: String(n) });
        },
      };
    },
  };
  return { counter, recorded };
};

describe('collectRequestAddressMetric', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('records ONE labeled increment per valid eth_call entry', async () => {
    const { counter, recorded } = makeCounterMock();
    await collectRequestAddressMetric({
      calls: [makeEthCall(VALID_UNKNOWN_TO)],
      referer: 'https://stake.lido.fi/',
      chainId: CHAINS.Mainnet,
      metrics: counter,
    });
    expect(recorded.length).toBe(1);
  });

  it('collapses unknown contract calls to "unknown" labels', async () => {
    const { counter, recorded } = makeCounterMock();
    await collectRequestAddressMetric({
      calls: [makeEthCall(VALID_UNKNOWN_TO)],
      referer: 'https://stake.lido.fi/',
      chainId: CHAINS.Mainnet,
      metrics: counter,
    });
    expect(recorded[0]).toMatchObject({
      address: 'unknown',
      contractName: 'unknown',
      methodEncoded: 'unknown',
      methodDecoded: 'unknown',
      referer: 'stake.lido.fi',
    });
  });

  it('categorizes off-allow-list Referer to "unknown"', async () => {
    const { counter, recorded } = makeCounterMock();
    await collectRequestAddressMetric({
      calls: [makeEthCall(VALID_UNKNOWN_TO)],
      referer: 'https://external.example/',
      chainId: CHAINS.Mainnet,
      metrics: counter,
    });
    expect(recorded[0].referer).toBe('unknown');
  });

  it('does NOT abort the batch when one entry has an invalid `to` address', async () => {
    // getAddress() throws on the middle entry; the two valid calls around
    // it must still be counted.
    const { counter, recorded } = makeCounterMock();
    await collectRequestAddressMetric({
      calls: [
        makeEthCall(VALID_UNKNOWN_TO),
        makeEthCall('not-a-valid-0x-address'),
        makeEthCall(VALID_UNKNOWN_TO),
      ],
      referer: 'https://stake.lido.fi/',
      chainId: CHAINS.Mainnet,
      metrics: counter,
    });
    expect(recorded.length).toBe(2);
  });

  it('skips non-eth_call methods without counting them', async () => {
    const { counter, recorded } = makeCounterMock();
    await collectRequestAddressMetric({
      calls: [
        { method: 'eth_getBalance', params: [VALID_UNKNOWN_TO, 'latest'] },
        makeEthCall(VALID_UNKNOWN_TO),
        { method: 'eth_blockNumber', params: [] },
      ],
      referer: 'https://stake.lido.fi/',
      chainId: CHAINS.Mainnet,
      metrics: counter,
    });
    expect(recorded.length).toBe(1);
  });

  it('skips eth_call without `to` (malformed params)', async () => {
    const { counter, recorded } = makeCounterMock();
    await collectRequestAddressMetric({
      calls: [
        { method: 'eth_call', params: [{ data: '0x' }, 'latest'] },
        makeEthCall(VALID_UNKNOWN_TO),
      ],
      referer: 'https://stake.lido.fi/',
      chainId: CHAINS.Mainnet,
      metrics: counter,
    });
    expect(recorded.length).toBe(1);
  });

  it('skips null entries in the batch without aborting subsequent calls', async () => {
    const { counter, recorded } = makeCounterMock();
    await collectRequestAddressMetric({
      calls: [null, makeEthCall(VALID_UNKNOWN_TO), undefined],
      referer: 'https://stake.lido.fi/',
      chainId: CHAINS.Mainnet,
      metrics: counter,
    });
    expect(recorded.length).toBe(1);
  });

  it('skips entries that are not objects (e.g. raw string in batch)', async () => {
    const { counter, recorded } = makeCounterMock();
    await collectRequestAddressMetric({
      calls: ['garbage', makeEthCall(VALID_UNKNOWN_TO), 42],
      referer: 'https://stake.lido.fi/',
      chainId: CHAINS.Mainnet,
      metrics: counter,
    });
    expect(recorded.length).toBe(1);
  });

  it('passes through with undefined referer (logs as "none")', async () => {
    const { counter, recorded } = makeCounterMock();
    await collectRequestAddressMetric({
      calls: [makeEthCall(VALID_UNKNOWN_TO)],
      referer: undefined,
      chainId: CHAINS.Mainnet,
      metrics: counter,
    });
    expect(recorded[0].referer).toBe('none');
  });
});
