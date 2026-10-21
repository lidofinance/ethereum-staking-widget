import {
  concatHex,
  getAddress,
  hexToBigInt,
  numberToHex,
  size,
  slice,
  zeroAddress,
  type Address,
  type Hex,
} from 'viem';
import { ERROR_CODE, invariant } from '@lidofinance/lido-ethereum-sdk/common';

import {
  BPS_PRECISION,
  LIDO_L2_SLOW_STAKE_MAX_FEE_BUFFER_BPS,
  type L2SlowStakeReturnFee,
} from './const';

/**
 * The packed byte layouts of the sender contract's FeeCodec library. Nothing
 * is ABI-padded: a field is exactly as wide as its type, and the length of
 * each blob is checked on chain, so every encoder here is width-exact
 */

type FeeOtoD = {
  // the cap on the CCIP fee; the send reverts when the live quote is above it
  maxFee: bigint;
  payInLink: boolean;
  // L1 gas committed for the receiver
  gasLimit: number;
};

// maxFee:uint128 | payInLink:uint8 | gasLimit:uint32, 21 bytes
export const encodeFeeOtoD = ({ maxFee, payInLink, gasLimit }: FeeOtoD): Hex =>
  concatHex([
    numberToHex(maxFee, { size: 16 }),
    numberToHex(payInLink ? 1 : 0, { size: 1 }),
    numberToHex(gasLimit, { size: 4 }),
  ]);

// feeAmount:uint128 | payInLink:uint8 | bridge-specific gas fields. The fee
// is only ever paid in native: every L1 bridge adapter rejects the LINK flag
// and the bytes cannot be changed once sent
export const encodeFeeDtoO = (fee: L2SlowStakeReturnFee): Hex => {
  const payInLink = numberToHex(0, { size: 1 });
  switch (fee.bridge) {
    // feeAmount 0 | 0 | l2Gas:uint32, 21 bytes
    case 'op-stack':
      return concatHex([
        numberToHex(0n, { size: 16 }),
        payInLink,
        numberToHex(fee.l2Gas, { size: 4 }),
      ]);
    // feeAmount | 0 | maxGas:uint32 | gasPriceBid:uint64, 29 bytes, where the
    // fee is the submission cost plus the whole gas bid
    case 'arbitrum': {
      const feeAmount =
        fee.maxSubmissionCost + fee.gasPriceBid * BigInt(fee.maxGas);
      return concatHex([
        numberToHex(feeAmount, { size: 16 }),
        payInLink,
        numberToHex(fee.maxGas, { size: 4 }),
        numberToHex(fee.gasPriceBid, { size: 8 }),
      ]);
    }
    // feeAmount 0 | 0, 17 bytes, no gas field
    case 'linea':
      return concatHex([numberToHex(0n, { size: 16 }), payInLink]);
  }
};

// The native amount the sender pulls on top of the stake for the way back
export const decodeFeeDtoOAmount = (feeDtoO: Hex): bigint => {
  invariant(
    size(feeDtoO) >= 17,
    'feeDtoO is shorter than 17 bytes',
    ERROR_CODE.INVALID_ARGUMENT,
  );
  return hexToBigInt(slice(feeDtoO, 0, 16));
};

// The message payload the L1 receiver decodes: recipient | amount | feeDtoO.
// Lower-cased, so equal payloads compare equal whatever the address casing
export const encodeSlowStakeData = (
  recipient: Address,
  amount: bigint,
  feeDtoO: Hex,
): Hex =>
  concatHex([
    recipient,
    numberToHex(amount, { size: 32 }),
    feeDtoO,
  ]).toLowerCase() as Hex;

// The payload back into its fields, for a message read from the CCIP API
export const decodeSlowStakeData = (
  data: Hex,
): { recipient: Address; amount: bigint; feeDtoO: Hex } => {
  invariant(
    size(data) >= 52,
    'slow stake payload is shorter than 52 bytes',
    ERROR_CODE.INVALID_ARGUMENT,
  );
  return {
    recipient: getAddress(slice(data, 0, 20)),
    amount: hexToBigInt(slice(data, 20, 52)),
    feeDtoO: slice(data, 52),
  };
};

// bytes4(keccak256("CCIP EVMExtraArgsV1")) followed by the ABI-encoded struct
export const CCIP_EVM_EXTRA_ARGS_V1_TAG = '0x97a657c9';

export const encodeCcipExtraArgsV1 = (gasLimit: number): Hex =>
  concatHex([CCIP_EVM_EXTRA_ARGS_V1_TAG, numberToHex(gasLimit, { size: 32 })]);

type SlowStakeCcipMessageArgs = {
  // the L1 receiver, as the sender stores it (ABI-encoded address)
  receiver: Hex;
  recipient: Address;
  // the lane's WETH: native ETH is wrapped before the message is built
  token: Address;
  amount: bigint;
  feeDtoO: Hex;
  feeAmountDtoO: bigint;
  gasLimit: number;
};

// The exact message the sender hands to the router, so a quote taken here
// is the one the send is priced at. The return-leg budget rides in the same
// token transfer, and the CCIP fee is paid in native
export const buildSlowStakeCcipMessage = ({
  receiver,
  recipient,
  token,
  amount,
  feeDtoO,
  feeAmountDtoO,
  gasLimit,
}: SlowStakeCcipMessageArgs) => ({
  receiver,
  data: encodeSlowStakeData(recipient, amount, feeDtoO),
  tokenAmounts: [{ token, amount: amount + feeAmountDtoO }],
  feeToken: zeroAddress,
  extraArgs: encodeCcipExtraArgsV1(gasLimit),
});

export const applySlowStakeMaxFeeBuffer = (ccipFee: bigint): bigint =>
  (ccipFee * LIDO_L2_SLOW_STAKE_MAX_FEE_BUFFER_BPS) / BPS_PRECISION;
