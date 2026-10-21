import {
  concat,
  decodeAbiParameters,
  keccak256,
  numberToHex,
  pad,
  size,
  slice,
  toRlp,
  zeroAddress,
  type Address,
  type Hash,
  type Hex,
} from 'viem';

/**
 * A retryable ticket's id is the hash of the submit-retryable transaction
 * Nitro builds from the L1 submission, so it is known from the L1 receipt
 * alone: the inbox logs the message number and the ticket's fields, the
 * bridge logs the (aliased) sender and the L1 base fee. Mirrors the
 * Arbitrum SDK's calculateSubmitRetryableId
 */

// the bridge's message kind of a retryable submission
export const ARBITRUM_L1_MESSAGE_TYPE_SUBMIT_RETRYABLE = 9;

export type ArbitrumSubmitRetryableMessage = {
  to: Address;
  l2CallValue: bigint;
  l1Value: bigint;
  maxSubmissionFee: bigint;
  excessFeeRefundAddress: Address;
  callValueRefundAddress: Address;
  gasLimit: bigint;
  maxFeePerGas: bigint;
  data: Hex;
};

const WORD = { type: 'uint256' } as const;
const toAddress = (word: bigint): Address =>
  pad(numberToHex(word), { size: 20 });

// The inbox packs the ticket as nine words (addresses widened to a word)
// and the call data after them
export const decodeArbitrumSubmitRetryableMessage = (
  data: Hex,
): ArbitrumSubmitRetryableMessage => {
  const [
    to,
    l2CallValue,
    l1Value,
    maxSubmissionFee,
    excessFeeRefundAddress,
    callValueRefundAddress,
    gasLimit,
    maxFeePerGas,
    dataLength,
  ] = decodeAbiParameters(
    [WORD, WORD, WORD, WORD, WORD, WORD, WORD, WORD, WORD],
    slice(data, 0, 9 * 32),
  );
  const callData = slice(data, 9 * 32);
  if (BigInt(size(callData)) !== dataLength)
    throw new Error('Retryable call data length does not match');
  return {
    to: toAddress(to),
    l2CallValue,
    l1Value,
    maxSubmissionFee,
    excessFeeRefundAddress: toAddress(excessFeeRefundAddress),
    callValueRefundAddress: toAddress(callValueRefundAddress),
    gasLimit,
    maxFeePerGas,
    data: callData,
  };
};

export type ArbitrumRetryableCreationIdParams =
  ArbitrumSubmitRetryableMessage & {
    l2ChainId: bigint;
    messageNumber: bigint;
    // the L1 sender as the bridge logged it, already aliased
    from: Address;
    l1BaseFee: bigint;
  };

// RLP quantities are minimal big-endian, and zero is the empty string
const quantity = (value: bigint): Hex =>
  value === 0n ? '0x' : numberToHex(value);

const SUBMIT_RETRYABLE_TX_TYPE: Hex = '0x69';

export const calculateArbitrumRetryableCreationId = ({
  l2ChainId,
  messageNumber,
  from,
  l1BaseFee,
  to,
  l2CallValue,
  l1Value,
  maxSubmissionFee,
  excessFeeRefundAddress,
  callValueRefundAddress,
  gasLimit,
  maxFeePerGas,
  data,
}: ArbitrumRetryableCreationIdParams): Hash =>
  keccak256(
    concat([
      SUBMIT_RETRYABLE_TX_TYPE,
      toRlp([
        quantity(l2ChainId),
        pad(numberToHex(messageNumber), { size: 32 }),
        from,
        quantity(l1BaseFee),
        quantity(l1Value),
        quantity(maxFeePerGas),
        quantity(gasLimit),
        to === zeroAddress ? '0x' : to,
        quantity(l2CallValue),
        callValueRefundAddress,
        quantity(maxSubmissionFee),
        excessFeeRefundAddress,
        data,
      ]),
    ]),
  );
