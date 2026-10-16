import { encodeAbiParameters, parseEther, parseGwei, size } from 'viem';

import {
  applySlowStakeMaxFeeBuffer,
  buildSlowStakeCcipMessage,
  decodeFeeDtoOAmount,
  encodeCcipExtraArgsV1,
  encodeFeeDtoO,
  encodeFeeOtoD,
  encodeSlowStakeData,
} from '../fee-codec';
import { LIDO_L2_SLOW_STAKE_LANES } from '../const';
import { CHAINS } from 'config/chains';

const RECIPIENT = '0x82A5d2E9A84b1347Ef311f0b71ABdD47A8849521';
const WETH = '0x4200000000000000000000000000000000000006';

// The blobs the protocol runs, byte for byte: the L1 leg is sized against
// them and a wrong shape strands the stake
const LANE_BLOBS = {
  [CHAINS.Optimism]: '0x0000000000000000000000000000000000000186a0',
  [CHAINS.Base]: '0x0000000000000000000000000000000000000186a0',
  [CHAINS.Arbitrum]:
    '0x00000000000000000003920acbffd00000000186a00000000002faf080',
  [CHAINS.Linea]: '0x0000000000000000000000000000000000',
} as const;

describe('encodeFeeOtoD', () => {
  it('packs maxFee, the rail and the gas limit into 21 bytes', () => {
    const encoded = encodeFeeOtoD({
      maxFee: 350_923_459_279_429n,
      payInLink: false,
      gasLimit: 400_000,
    });
    expect(size(encoded)).toBe(21);
    // the worked example's calldata: maxFee | 00 | 0x00061a80
    expect(encoded).toBe('0x000000000000000000013f29bc223a450000061a80');
  });

  it('sets the rail byte for LINK', () => {
    expect(
      encodeFeeOtoD({ maxFee: 1n, payInLink: true, gasLimit: 75_000 }),
    ).toBe('0x0000000000000000000000000000000101000124f8');
  });

  it('rejects values wider than their field', () => {
    expect(() =>
      encodeFeeOtoD({ maxFee: 2n ** 128n, payInLink: false, gasLimit: 1 }),
    ).toThrow();
    expect(() =>
      encodeFeeOtoD({ maxFee: 1n, payInLink: false, gasLimit: 2 ** 32 }),
    ).toThrow();
  });
});

describe('encodeFeeDtoO', () => {
  it.each(Object.entries(LANE_BLOBS))(
    'encodes the lane constant for chain %s verbatim',
    (chainId, blob) => {
      const lane = LIDO_L2_SLOW_STAKE_LANES[Number(chainId)];
      if (!lane) throw new Error(`lane ${chainId} is not configured`);
      expect(encodeFeeDtoO(lane.returnFee)).toBe(blob);
    },
  );

  it('prices the Arbitrum retryable as submission cost plus the gas bid', () => {
    const encoded = encodeFeeDtoO({
      bridge: 'arbitrum',
      maxSubmissionCost: parseEther('0.001'),
      maxGas: 100_000,
      gasPriceBid: parseGwei('0.05'),
    });
    expect(size(encoded)).toBe(29);
    expect(decodeFeeDtoOAmount(encoded)).toBe(
      parseEther('0.001') + parseGwei('0.05') * 100_000n,
    );
  });

  it('charges nothing on the OP-stack and Linea legs', () => {
    expect(
      decodeFeeDtoOAmount(encodeFeeDtoO({ bridge: 'op-stack', l2Gas: 1 })),
    ).toBe(0n);
    expect(decodeFeeDtoOAmount(encodeFeeDtoO({ bridge: 'linea' }))).toBe(0n);
  });

  it('rejects a blob shorter than the fee field', () => {
    expect(() => decodeFeeDtoOAmount('0x00')).toThrow();
  });
});

describe('message encoding', () => {
  it('packs recipient, amount and feeDtoO without padding', () => {
    // the worked example's payload
    expect(
      encodeSlowStakeData(
        RECIPIENT,
        1_000_000_000_000n,
        // feeDtoO of that stake: l2Gas 250,000 on the OP bridge
        '0x00000000000000000000000000000000000003d090',
      ),
    ).toBe(
      '0x82a5d2e9a84b1347ef311f0b71abdd47a8849521000000000000000000000000000000000000000000000000000000e8d4a5100000000000000000000000000000000000000003d090',
    );
  });

  it('tags the extra args as EVMExtraArgsV1', () => {
    expect(encodeCcipExtraArgsV1(1_000_000)).toBe(
      '0x97a657c900000000000000000000000000000000000000000000000000000000000f4240',
    );
  });

  it('builds the message the sender builds', () => {
    const receiver = encodeAbiParameters(
      [{ type: 'address' }],
      ['0x6F357d53d6bE3238180316BA5F8f11467e164588'],
    );
    const feeDtoO = LANE_BLOBS[CHAINS.Arbitrum];
    const message = buildSlowStakeCcipMessage({
      receiver,
      recipient: RECIPIENT,
      token: WETH,
      amount: parseEther('1'),
      feeDtoO,
      feeAmountDtoO: decodeFeeDtoOAmount(feeDtoO),
      gasLimit: 1_000_000,
    });
    expect(message).toEqual({
      receiver,
      data: encodeSlowStakeData(RECIPIENT, parseEther('1'), feeDtoO),
      // the return-leg budget rides in the same transfer
      tokenAmounts: [{ token: WETH, amount: parseEther('1.001005') }],
      feeToken: '0x0000000000000000000000000000000000000000',
      extraArgs: encodeCcipExtraArgsV1(1_000_000),
    });
  });
});

describe('applySlowStakeMaxFeeBuffer', () => {
  it('caps at 1.2x the quote, rounded down', () => {
    expect(applySlowStakeMaxFeeBuffer(100n)).toBe(120n);
    expect(applySlowStakeMaxFeeBuffer(1n)).toBe(1n);
    expect(applySlowStakeMaxFeeBuffer(0n)).toBe(0n);
  });
});
