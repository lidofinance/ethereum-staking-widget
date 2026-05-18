import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';

// Mock the contract-address map so the `collect-request-address-metric`
// module does NOT pull in the project's `config/` chain at import time
// (which transitively imports `env-dynamics.mjs` — Jest can't parse it
// without ESM config). The mocked map is intentionally empty: tests cover
// the UNKNOWN-contract code path, which is the one the security batch
// hardened (`address` / `methodEncoded` collapse to `'unknown'`).
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

/**
 * Minimal mock of prom-client Counter that records each .labels(...).inc(1)
 * invocation so tests can assert label tuples.
 */
const makeCounterMock = () => {
  const recorded: LabelArgs[] = [];
  const counter: any = {
    labels(labels: LabelArgs) {
      return {
        inc: (n: number) => {
          // store a snapshot — labels may be reused if the caller is sloppy
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
      methodEncoded: 'unknown', // bounded — selector NOT kept for unknown contracts
      methodDecoded: 'unknown',
      referer: 'stake.lido.fi',
    });
  });

  it('categorizes attacker-controlled Referer to "unknown"', async () => {
    const { counter, recorded } = makeCounterMock();
    await collectRequestAddressMetric({
      calls: [makeEthCall(VALID_UNKNOWN_TO)],
      referer: 'https://attacker.example/',
      chainId: CHAINS.Mainnet,
      metrics: counter,
    });
    expect(recorded[0].referer).toBe('unknown');
  });

  // ---- batch-poisoning regression tests (the M-NEW / H2 fix) ----

  it('does NOT abort the batch when one entry has an invalid `to` address', async () => {
    // `getAddress('not-a-valid-0x-address')` throws — without the try/catch
    // around forEach body, this used to silently drop metrics for the
    // remaining calls in the batch.
    const { counter, recorded } = makeCounterMock();
    await collectRequestAddressMetric({
      calls: [
        makeEthCall(VALID_UNKNOWN_TO), // OK
        makeEthCall('not-a-valid-0x-address'), // throws inside forEach
        makeEthCall(VALID_UNKNOWN_TO), // must still be counted
      ],
      referer: 'https://stake.lido.fi/',
      chainId: CHAINS.Mainnet,
      metrics: counter,
    });

    // Two valid calls → two increments. The poisoned middle entry is skipped
    // (it's logged via console.warn, but does NOT throw out of forEach).
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
        { method: 'eth_call', params: [{ data: '0x' }, 'latest'] }, // no `to`
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
