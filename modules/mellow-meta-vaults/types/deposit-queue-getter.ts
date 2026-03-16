import { PublicClient, WalletClient } from 'viem';
import { DepositQueueWritableContract } from './contracts';

export type DepositQueueGetter<
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
}) => DepositQueueWritableContract;
