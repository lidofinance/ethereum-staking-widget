// Empty map → tests cover the unknown-contract path. Mock also avoids
// pulling `config/networks` (which reads env-dynamics at import time).
vi.mock('config/networks/rpc-contracts', () => ({
  METRIC_CONTRACT_ADDRESSES: {},
  getMetricContractAbi: () => null,
}));

import type { MockInstance } from 'vitest';
import type { Counter } from 'prom-client';

import { collectRequestAddressMetric } from '../collect-request-address-metric.js';

const CHAIN_MAINNET = 1;
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
  const counter = {
    labels(labels: LabelArgs) {
      return {
        inc: (n: number) => {
          recorded.push({ ...labels, __inc: String(n) });
        },
      };
    },
  } as unknown as Counter<string>;
  return { counter, recorded };
};

describe('collectRequestAddressMetric', () => {
  let warnSpy: MockInstance;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('records ONE labeled increment per valid eth_call entry', () => {
    const { counter, recorded } = makeCounterMock();
    collectRequestAddressMetric({
      calls: [makeEthCall(VALID_UNKNOWN_TO)],
      chainId: CHAIN_MAINNET,
      metrics: counter,
    });
    expect(recorded.length).toBe(1);
  });

  it('collapses unknown contract calls to "unknown" labels', () => {
    const { counter, recorded } = makeCounterMock();
    collectRequestAddressMetric({
      calls: [makeEthCall(VALID_UNKNOWN_TO)],
      chainId: CHAIN_MAINNET,
      metrics: counter,
    });
    expect(recorded[0]).toMatchObject({
      address: 'unknown',
      contractName: 'unknown',
      methodEncoded: 'unknown',
      methodDecoded: 'unknown',
    });
  });

  it('does NOT abort the batch when one entry has an invalid `to` address', () => {
    const { counter, recorded } = makeCounterMock();
    collectRequestAddressMetric({
      calls: [
        makeEthCall(VALID_UNKNOWN_TO),
        makeEthCall('not-a-valid-0x-address'),
        makeEthCall(VALID_UNKNOWN_TO),
      ],
      chainId: CHAIN_MAINNET,
      metrics: counter,
    });
    expect(recorded.length).toBe(2);
  });

  it('skips non-eth_call methods without counting them', () => {
    const { counter, recorded } = makeCounterMock();
    collectRequestAddressMetric({
      calls: [
        { method: 'eth_getBalance', params: [VALID_UNKNOWN_TO, 'latest'] },
        makeEthCall(VALID_UNKNOWN_TO),
        { method: 'eth_blockNumber', params: [] },
      ],
      chainId: CHAIN_MAINNET,
      metrics: counter,
    });
    expect(recorded.length).toBe(1);
  });

  it('skips eth_call without `to` (malformed params)', () => {
    const { counter, recorded } = makeCounterMock();
    collectRequestAddressMetric({
      calls: [
        { method: 'eth_call', params: [{ data: '0x' }, 'latest'] },
        makeEthCall(VALID_UNKNOWN_TO),
      ],
      chainId: CHAIN_MAINNET,
      metrics: counter,
    });
    expect(recorded.length).toBe(1);
  });

  it('skips null entries in the batch without aborting subsequent calls', () => {
    const { counter, recorded } = makeCounterMock();
    collectRequestAddressMetric({
      calls: [null, makeEthCall(VALID_UNKNOWN_TO), undefined],
      chainId: CHAIN_MAINNET,
      metrics: counter,
    });
    expect(recorded.length).toBe(1);
  });

  it('skips entries that are not objects (e.g. raw string in batch)', () => {
    const { counter, recorded } = makeCounterMock();
    collectRequestAddressMetric({
      calls: ['garbage', makeEthCall(VALID_UNKNOWN_TO), 42],
      chainId: CHAIN_MAINNET,
      metrics: counter,
    });
    expect(recorded.length).toBe(1);
  });

  // Log lines must stay bounded regardless of entry size: parser errors can
  // quote their whole input back.
  it('never logs an oversized `to` value, and keeps processing the batch', async () => {
    const { counter, recorded } = makeCounterMock();
    const oversizedTo = `0x${'a'.repeat(128 * 1024)}`;

    await collectRequestAddressMetric({
      calls: [makeEthCall(oversizedTo), makeEthCall(VALID_UNKNOWN_TO)],
      chainId: CHAIN_MAINNET,
      metrics: counter,
    });

    expect(recorded.length).toBe(1);
    for (const args of warnSpy.mock.calls) {
      const line = args.map(String).join(' ');
      expect(line.length).toBeLessThan(1024);
      expect(line).not.toContain('aaaaaaaaaa');
    }
  });

  it('bounds the logged text when a call throws', async () => {
    const { counter } = makeCounterMock();
    // 42-char `to` passes the length guard but fails checksum parsing, so this
    // exercises the catch branch.
    await collectRequestAddressMetric({
      calls: [makeEthCall(`0x${'z'.repeat(40)}`)],
      chainId: CHAIN_MAINNET,
      metrics: counter,
    });

    expect(warnSpy).toHaveBeenCalled();
    for (const args of warnSpy.mock.calls) {
      expect(args.map(String).join(' ').length).toBeLessThan(512);
    }
  });
});
