import { PublicClient, WalletClient } from 'viem';

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
}) => any; // TODO: fix any
