import { renderToStaticMarkup } from 'react-dom/server';
import type { Hash } from 'viem';
import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';

import type { AACall, TxCallbackProps } from './types';

const ACCOUNT = '0x00000000000000000000000000000000000000aa';
const CALL_ID = '0xcall';
const TX_HASH: Hash =
  '0x1111111111111111111111111111111111111111111111111111111111111111';

const state = vi.hoisted(() => ({
  sendCalls: vi.fn(),
  waitForCallsStatus: vi.fn(),
}));

vi.mock('wagmi', () => ({
  useConnection: () => ({ address: ACCOUNT }),
}));
vi.mock('config', () => ({
  config: { PROVIDER_POLLING_INTERVAL: 1, AA_TX_POLLING_TIMEOUT: 1 },
}));
vi.mock('../../web3-provider/lido-sdk', () => ({
  useLidoSDK: () => ({
    core: {
      walletClient: {
        sendCalls: state.sendCalls,
        waitForCallsStatus: state.waitForCallsStatus,
      },
    },
  }),
}));
vi.mock('../../web3-provider/lido-sdk-l2', () => ({
  useLidoSDKL2: () => ({ core: undefined, isL2: false }),
}));

import { useSendAACalls } from './use-send-aa-calls';

// Hooks run during a server render; the returned callback is then driven
// outside of React like the tx flow would
const renderHook = <T,>(useHook: () => T): T => {
  let value: T | undefined;
  const Probe = () => {
    value = useHook();
    return null;
  };
  renderToStaticMarkup(<Probe />);
  return value as T;
};

const call = (n: number): AACall => ({
  to: `0x${String(n).padStart(40, '0')}`,
  data: '0x',
});

const send = (calls: (AACall | null)[]) => {
  const stages: TxCallbackProps['stage'][] = [];
  const result = renderHook(useSendAACalls)(calls, async (props) => {
    stages.push(props.stage);
  });
  return { result, stages };
};

const sentWith = () => state.sendCalls.mock.calls[0]?.[0];

beforeEach(() => {
  vi.clearAllMocks();
  state.sendCalls.mockResolvedValue({ id: CALL_ID });
  state.waitForCallsStatus.mockResolvedValue({
    status: 'success',
    receipts: [{ status: 'success', transactionHash: TX_HASH }],
  });
});

describe('useSendAACalls', () => {
  it('requires atomic execution for a batch of dependent calls', async () => {
    const { result, stages } = send([call(1), call(2)]);
    await expect(result).resolves.toMatchObject({ txHash: TX_HASH });

    expect(sentWith()).toMatchObject({
      account: ACCOUNT,
      forceAtomic: true,
      experimental_fallback: true,
    });
    expect(sentWith().calls).toHaveLength(2);
    expect(stages).toEqual([
      TransactionCallbackStage.SIGN,
      TransactionCallbackStage.RECEIPT,
      TransactionCallbackStage.DONE,
    ]);
  });

  it('lets a single call fall back to a legacy transaction', async () => {
    // a skipped approval leaves a hole, not a second call
    const { result } = send([null, call(1)]);
    await expect(result).resolves.toMatchObject({ txHash: TX_HASH });

    expect(sentWith()).toMatchObject({
      forceAtomic: false,
      experimental_fallback: true,
    });
    expect(sentWith().calls).toHaveLength(1);
  });

  it('reports a refused batch as an error and rethrows', async () => {
    // what viem throws when a wallet without wallet_sendCalls would have to
    // split a batch that must stay atomic
    const refused = new Error(
      '`forceAtomic` is not supported on fallback to `eth_sendTransaction`.',
    );
    state.sendCalls.mockRejectedValue(refused);

    const { result, stages } = send([call(1), call(2)]);
    await expect(result).rejects.toBe(refused);

    expect(state.waitForCallsStatus).not.toHaveBeenCalled();
    expect(stages).toEqual([
      TransactionCallbackStage.SIGN,
      TransactionCallbackStage.ERROR,
    ]);
  });
});
