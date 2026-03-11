import { GetContractReturnType, Abi, Client, Address } from 'viem';
import {
  VAULT_ABI,
  COLLECTOR_ABI,
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

export type DepositQueueContract = ContractReadonly<typeof DEPOSIT_QUEUE_ABI>;

export type DepositQueueWritableContract = Contract<typeof DEPOSIT_QUEUE_ABI>;

export type RedeemQueueContract = ContractReadonly<typeof REDEEM_QUEUE_ABI>;

export type RedeemQueueWritableContract = Contract<typeof REDEEM_QUEUE_ABI>;

export type ShareManagerContract = Contract<typeof SHARE_MANAGER_ABI>;
