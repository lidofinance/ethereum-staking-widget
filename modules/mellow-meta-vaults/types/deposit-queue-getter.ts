import { PublicClient, WalletClient } from 'viem';
import {
  AsyncDepositQueueWritableContract,
  SyncDepositQueueWritableContract,
} from './contracts';

type DepositQueueGetterArgs<
  DepositToken extends string,
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient,
> = {
  publicClient: TPublicClient;
  walletClient: TWalletClient;
  token: DepositToken;
};

export type AsyncDepositQueueGetter<
  DepositToken extends string,
  TPublicClient extends PublicClient = PublicClient,
  TWalletClient extends WalletClient = WalletClient,
> = (
  args: DepositQueueGetterArgs<DepositToken, TPublicClient, TWalletClient>,
) => AsyncDepositQueueWritableContract;

// undefined for a token that has no sync queue
export type SyncDepositQueueGetter<
  DepositToken extends string,
  TPublicClient extends PublicClient = PublicClient,
  TWalletClient extends WalletClient = WalletClient,
> = (
  args: DepositQueueGetterArgs<DepositToken, TPublicClient, TWalletClient>,
) => SyncDepositQueueWritableContract | undefined;
