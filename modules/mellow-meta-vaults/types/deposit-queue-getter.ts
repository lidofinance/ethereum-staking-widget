import { PublicClient, WalletClient } from 'viem';
import {
  AsyncDepositQueueWritableContract,
  SyncDepositQueueWritableContract,
} from './contracts';

/**
 * @deprecated Use SyncDepositQueueGetter instead
 */
export type AsyncDepositQueueGetter<
  DepositToken extends string,
  TPublicClient extends PublicClient = PublicClient,
  TWalletClient extends WalletClient = WalletClient,
> = ({
  publicClient,
  walletClient,
  token,
}: {
  publicClient: TPublicClient;
  walletClient: TWalletClient;
  token: DepositToken;
}) => AsyncDepositQueueWritableContract;

export type SyncDepositQueueGetter<
  DepositToken extends string,
  TPublicClient extends PublicClient = PublicClient,
  TWalletClient extends WalletClient = WalletClient,
> = ({
  publicClient,
  walletClient,
  token,
}: {
  publicClient: TPublicClient;
  walletClient: TWalletClient;
  token: DepositToken;
}) => SyncDepositQueueWritableContract;
