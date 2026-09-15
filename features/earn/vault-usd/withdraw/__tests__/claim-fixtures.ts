import {
  encodeAbiParameters,
  encodeEventTopics,
  type Log,
  type Address,
  type TransactionReceipt,
} from 'viem';
import { ASYNC_REDEEM_QUEUE_ABI } from 'modules/mellow-meta-vaults/abi';
export const account = '0x0000000000000000000000000000000000000001';
export const usdcQueue = '0x0000000000000000000000000000000000000002';
export const usdtQueue = '0x0000000000000000000000000000000000000003';
export const claimLog = (
  address: Address = usdcQueue,
  timestamp = 1,
): Log<bigint, number, false> => ({
  address,
  blockHash: '0xabc',
  blockNumber: 1n,
  logIndex: 0,
  transactionHash: '0x123',
  transactionIndex: 0,
  removed: false,
  topics: encodeEventTopics({
    abi: ASYNC_REDEEM_QUEUE_ABI,
    eventName: 'RedeemRequestClaimed',
    args: { account, receiver: account },
  }) as Log['topics'],
  data: encodeAbiParameters(
    [{ type: 'uint256' }, { type: 'uint32' }],
    [10n, timestamp],
  ),
});

// A reverted transaction carries no surviving events, so its receipt only
// identifies which transaction failed.
export const revertedReceipt = (
  transactionHash: `0x${string}` = '0x123',
): TransactionReceipt => ({
  ...claimReceipt([], transactionHash),
  status: 'reverted',
});

export const claimReceipt = (
  logs: Log<bigint, number, false>[],
  transactionHash: `0x${string}` = '0x123',
): TransactionReceipt => ({
  status: 'success',
  transactionHash,
  logs,
  blockHash: '0xabc',
  blockNumber: 1n,
  contractAddress: null,
  cumulativeGasUsed: 1n,
  effectiveGasPrice: 1n,
  from: account,
  gasUsed: 1n,
  logsBloom: '0x',
  to: usdcQueue,
  transactionIndex: 0,
  type: 'eip1559',
});
