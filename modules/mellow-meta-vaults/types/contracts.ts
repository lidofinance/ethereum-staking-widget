import { GetContractReturnType, Abi, Client, Address } from 'viem';
import {
  VAULT_ABI,
  COLLECTOR_ABI,
  SYNC_DEPOSIT_QUEUE_ABI,
  DEPOSIT_QUEUE_ABI,
  ASYNC_REDEEM_QUEUE_ABI,
  SYNC_REDEEM_QUEUE_ABI,
  SHARE_MANAGER_ABI,
} from '../abi';

export type Contract<TAbi extends Abi = Abi> = GetContractReturnType<
  TAbi,
  Client,
  Address
>;

export type ContractReadonly<TAbi extends Abi = Abi> = Omit<
  Contract<TAbi>,
  'write'
>;

export type CollectorContract = ContractReadonly<typeof COLLECTOR_ABI>;

export type VaultContract = ContractReadonly<typeof VAULT_ABI>;

export type VaultWritableContract = Contract<typeof VAULT_ABI>;

export type AsyncDepositQueueContract = ContractReadonly<
  typeof DEPOSIT_QUEUE_ABI
>;

export type SyncDepositQueueContract = ContractReadonly<
  typeof SYNC_DEPOSIT_QUEUE_ABI
>;

export type DepositQueueContract =
  AsyncDepositQueueContract | SyncDepositQueueContract;

export type AsyncDepositQueueWritableContract = Contract<
  typeof DEPOSIT_QUEUE_ABI
>;

export type SyncDepositQueueWritableContract = Contract<
  typeof SYNC_DEPOSIT_QUEUE_ABI
>;

export type DepositQueueWritableContract =
  AsyncDepositQueueWritableContract | SyncDepositQueueWritableContract;

export type AsyncRedeemQueueContract = ContractReadonly<
  typeof ASYNC_REDEEM_QUEUE_ABI
>;

export type AsyncRedeemQueueWritableContract = Contract<
  typeof ASYNC_REDEEM_QUEUE_ABI
>;

export type SyncRedeemQueueContract = ContractReadonly<
  typeof SYNC_REDEEM_QUEUE_ABI
>;

export type SyncRedeemQueueWritableContract = Contract<
  typeof SYNC_REDEEM_QUEUE_ABI
>;

export type ShareManagerContract = Contract<typeof SHARE_MANAGER_ABI>;
