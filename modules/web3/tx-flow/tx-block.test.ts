import {
  isTxBlockOf,
  recordTxBlock,
  waitForBlock,
  type TxBlockScope,
} from './tx-block';

const ACCOUNT = '0x00000000000000000000000000000000000000aa';
const OTHER_ACCOUNT = '0x00000000000000000000000000000000000000bb';
const scope: TxBlockScope = { chainId: 1, address: ACCOUNT };

describe('isTxBlockOf', () => {
  const block = { ...scope, blockNumber: 100n };

  it('matches the chain and the account, whatever the address case', () => {
    expect(isTxBlockOf(block, scope)).toBe(true);
    expect(
      isTxBlockOf(block, {
        chainId: 1,
        address: ACCOUNT.toUpperCase().replace('0X', '0x') as `0x${string}`,
      }),
    ).toBe(true);
  });

  it('does not match another chain or another account', () => {
    expect(isTxBlockOf(block, { ...scope, chainId: 10 })).toBe(false);
    expect(isTxBlockOf(block, { ...scope, address: OTHER_ACCOUNT })).toBe(
      false,
    );
  });
});

describe('recordTxBlock', () => {
  it('starts from the first block', () => {
    expect(recordTxBlock(null, scope, 100n)).toEqual({
      ...scope,
      blockNumber: 100n,
    });
  });

  it('keeps the later block within a scope', () => {
    const last = { ...scope, blockNumber: 100n };
    expect(recordTxBlock(last, scope, 99n)).toBe(last);
    expect(recordTxBlock(last, scope, 101n)).toEqual({
      ...scope,
      blockNumber: 101n,
    });
  });

  it('replaces the block of another chain or account, even a later one', () => {
    const last = { ...scope, blockNumber: 500n };
    expect(recordTxBlock(last, { ...scope, chainId: 10 }, 100n)).toEqual({
      ...scope,
      chainId: 10,
      blockNumber: 100n,
    });
    expect(
      recordTxBlock(last, { ...scope, address: OTHER_ACCOUNT }, 100n),
    ).toEqual({ ...scope, address: OTHER_ACCOUNT, blockNumber: 100n });
  });
});

const run = (
  getLatestBlockNumber: () => Promise<bigint | null>,
  isCurrent = () => true,
) =>
  waitForBlock({
    getLatestBlockNumber,
    blockNumber: 100n,
    isCurrent,
    timeout: 3_000,
    interval: 1_000,
  });

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('waitForBlock', () => {
  it('resolves at once when the block is already served', async () => {
    const read = vi.fn(async () => 101n);
    await expect(run(read)).resolves.toBe(true);
    expect(read).toHaveBeenCalledTimes(1);
  });

  it('checks again each interval until the block is served', async () => {
    const read = vi
      .fn<() => Promise<bigint | null>>()
      .mockResolvedValueOnce(98n)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(100n);
    const wait = run(read);

    await vi.advanceTimersByTimeAsync(2_000);
    await expect(wait).resolves.toBe(true);
    expect(read).toHaveBeenCalledTimes(3);
  });

  it('gives up at the timeout', async () => {
    const read = vi.fn(async () => 99n);
    const wait = run(read);

    await vi.advanceTimersByTimeAsync(3_000);
    await expect(wait).resolves.toBe(false);
    // at 0, 1s, 2s and 3s
    expect(read).toHaveBeenCalledTimes(4);
  });

  it('gives up on a failed read without retrying', async () => {
    const read = vi.fn(async () => {
      throw new Error('rpc down');
    });

    await expect(run(read)).resolves.toBe(false);
    expect(read).toHaveBeenCalledTimes(1);
  });

  it('stops once the flow went stale', async () => {
    let isCurrent = true;
    const read = vi.fn(async () => 99n);
    const wait = run(read, () => isCurrent);

    await vi.advanceTimersByTimeAsync(0);
    isCurrent = false;
    await vi.advanceTimersByTimeAsync(1_000);

    await expect(wait).resolves.toBe(false);
    expect(read).toHaveBeenCalledTimes(1);
  });
});
