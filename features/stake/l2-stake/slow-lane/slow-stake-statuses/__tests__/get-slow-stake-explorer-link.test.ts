import type { Hash } from 'viem';
import { base, mainnet } from 'viem/chains';
import type { L2SlowStakeStatus } from 'modules/l2-staking';

vi.mock('modules/web3', () => ({
  wagmiChainMap: { [mainnet.id]: mainnet, [base.id]: base },
}));

import { getSlowStakeExplorerLink } from '../get-slow-stake-explorer-link';

const MESSAGE_ID: Hash =
  '0xf50ff3791ba99db683b51a711436712b130ace8cb0f42789850b5f3cdc56cd5e';
const SEND_TX: Hash =
  '0x3435a1409eafa7a896e7ac3b3222d5d5379373d412a480e3463f358217ab075e';
const L1_TX: Hash =
  '0x1d623b407783ea0023ba18673b39688383a7028fdc8d43d855553b46eba971c6';
const L2_TX: Hash =
  '0x4444444444444444444444444444444444444444444444444444444444444444';
const CCIP_URL = `https://ccip.chain.link/msg/${MESSAGE_ID}`;

const base_ = {
  messageId: MESSAGE_ID,
  user: '0x00000000000000000000000000000000000000aa',
  token: '0x4200000000000000000000000000000000000006',
  amount: 10n ** 18n,
  sendTxHash: SEND_TX,
  sendBlockNumber: 1n,
  sendTimestampMs: 0,
  ccipExplorerUrl: CCIP_URL,
} as const;
const staked = {
  l1TxHash: L1_TX,
  l1BlockNumber: 2n,
  stakedAmount: 10n ** 18n,
  returnLeg: { bridge: 'op-stack', l2TxHash: L2_TX },
} as const;

const status = (rest: object) =>
  ({ ...base_, ...rest }) as unknown as L2SlowStakeStatus;

const link = (rest: object) => getSlowStakeExplorerLink(status(rest), base.id);

describe('getSlowStakeExplorerLink', () => {
  it('points a send at the L2 explorer', () => {
    expect(link({ outcome: 'inflight', stage: 'sent' })).toEqual({
      text: 'View on Block Explorer',
      url: `https://basescan.org/tx/${SEND_TX}`,
    });
  });

  it('points a send without its hash yet at the CCIP explorer', () => {
    expect(
      link({ outcome: 'inflight', stage: 'sent', sendTxHash: '0x' }),
    ).toEqual({ text: 'View on CCIP Explorer', url: CCIP_URL });
  });

  it.each(['in_transit', 'transport_failed'])(
    'points %s at the CCIP explorer',
    (stage) => {
      expect(link({ stage, ccipStatus: 'COMMITTED' })).toEqual({
        text: 'View on CCIP Explorer',
        url: CCIP_URL,
      });
    },
  );

  it.each(['parked', 'recovered', 'unresolved', 'bridging'])(
    'points %s at the Ethereum transaction',
    (stage) => {
      expect(link({ ...staked, stage })).toEqual({
        text: 'View on Etherscan',
        url: `https://etherscan.io/tx/${L1_TX}`,
      });
    },
  );

  it.each(['delivered', 'relay_failed'])(
    'points %s at the L2 landing when it has one',
    (stage) => {
      expect(link({ ...staked, stage, l2TxHash: L2_TX })).toEqual({
        text: 'View on Block Explorer',
        url: `https://basescan.org/tx/${L2_TX}`,
      });
      expect(link({ ...staked, stage })).toMatchObject({
        text: 'View on Etherscan',
      });
    },
  );

  it('refuses a chain the app does not know', () => {
    expect(() =>
      getSlowStakeExplorerLink(
        status({ outcome: 'inflight', stage: 'sent' }),
        59144,
      ),
    ).toThrow(/unknown/);
  });
});
