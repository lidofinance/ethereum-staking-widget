import { GetContractReturnType, Abi, Client, Address } from 'viem';
import {
  VAULT_ABI,
  COLLECTOR_ABI,
  SYNC_DEPOSIT_QUEUE_ABI,
  DEPOSIT_QUEUE_ABI,
  REDEEM_QUEUE_ABI,
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

/**
 * @deprecated Use SyncDepositQueueContract instead
 */
export type AsyncDepositQueueContract = ContractReadonly<
  typeof DEPOSIT_QUEUE_ABI
>;

export type SyncDepositQueueContract = ContractReadonly<
  typeof SYNC_DEPOSIT_QUEUE_ABI
>;

/**
 * @deprecated Use SyncDepositQueueWritableContract instead
 */
export type AsyncDepositQueueWritableContract = Contract<
  typeof DEPOSIT_QUEUE_ABI
>;

export type SyncDepositQueueWritableContract = Contract<
  typeof SYNC_DEPOSIT_QUEUE_ABI
>;

export type RedeemQueueContract = ContractReadonly<typeof REDEEM_QUEUE_ABI>;

export type RedeemQueueWritableContract = Contract<typeof REDEEM_QUEUE_ABI>;

export type ShareManagerContract = Contract<typeof SHARE_MANAGER_ABI>;
