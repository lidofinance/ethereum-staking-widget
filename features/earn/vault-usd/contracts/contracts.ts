import invariant from 'tiny-invariant';
import { getContract, WalletClient, type PublicClient } from 'viem';

import { getContractAddress } from 'config/networks/contract-address';
import {
  VAULT_ABI,
  COLLECTOR_ABI,
  DEPOSIT_QUEUE_ABI,
  SYNC_DEPOSIT_QUEUE_ABI,
  REDEEM_QUEUE_ABI,
  SHARE_MANAGER_ABI,
} from 'modules/mellow-meta-vaults/abi';
import { TOKENS } from 'consts/tokens';
import type { UsdDepositToken } from '../types';

export const getVaultContract = <TPublicClient extends PublicClient>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'usdVault',
  );

  invariant(
    address,
    `no USD Vault contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: VAULT_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getVaultWritableContract = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'usdVault',
  );
  invariant(
    address,
    `no USD Vault contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: VAULT_ABI,
    address,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

export const getRedeemQueueContractUSDC = <TPublicClient extends PublicClient>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'usdRedeemQueueUSDC',
  );
  invariant(
    address,
    `no USD Redeem Queue USDC contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: REDEEM_QUEUE_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getRedeemQueueWritableContractUSDC = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'usdRedeemQueueUSDC',
  );
  invariant(
    address,
    `no USD Redeem Queue USDC contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: REDEEM_QUEUE_ABI,
    address,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

export const getSyncDepositQueueContractAddress = <
  TPublicClient extends PublicClient,
>({
  publicClient,
  token,
}: {
  publicClient: TPublicClient;
  token: UsdDepositToken;
}) => {
  let contractName;
  switch (token) {
    case TOKENS.usdt:
      contractName = 'usdSyncDepositQueueUSDT' as const;
      break;
    case TOKENS.usdc:
      contractName = 'usdSyncDepositQueueUSDC' as const;
      break;
    default:
      throw new Error(`Unsupported token: ${token}`);
  }

  const address = getContractAddress(
    publicClient.chain?.id as number,
    contractName,
  );
  invariant(
    address,
    `no USD Deposit Queue ${token} contract address for ${publicClient.chain?.id}`,
  );
  return address;
};

export const getAsyncDepositQueueContractAddress = <
  TPublicClient extends PublicClient,
>({
  publicClient,
  token,
}: {
  publicClient: TPublicClient;
  token: UsdDepositToken;
}) => {
  let contractName;
  switch (token) {
    case TOKENS.usdt:
      contractName = 'usdDepositQueueUSDT' as const;
      break;
    case TOKENS.usdc:
      contractName = 'usdDepositQueueUSDC' as const;
      break;
    default:
      throw new Error(`Unsupported token: ${token}`);
  }

  const address = getContractAddress(
    publicClient.chain?.id as number,
    contractName,
  );
  invariant(
    address,
    `no async USD Deposit Queue ${token} contract address for ${publicClient.chain?.id}`,
  );
  return address;
};

export const getSyncDepositQueueContract = <
  TPublicClient extends PublicClient,
>({
  publicClient,
  token,
}: {
  publicClient: TPublicClient;
  token: UsdDepositToken;
}) => {
  return getContract({
    abi: SYNC_DEPOSIT_QUEUE_ABI,
    address: getSyncDepositQueueContractAddress({ publicClient, token }),
    client: {
      public: publicClient,
    },
  });
};

export const getSyncDepositQueueWritableContract = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>({
  publicClient,
  walletClient,
  token,
}: {
  publicClient: TPublicClient;
  walletClient: TWalletClient;
  token: UsdDepositToken;
}) => {
  return getContract({
    abi: SYNC_DEPOSIT_QUEUE_ABI,
    address: getSyncDepositQueueContractAddress({ publicClient, token }),
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

/**
 * @deprecated Use getSyncDepositQueueWritableContract instead
 */
export const getAsyncDepositQueueWritableContract = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>({
  publicClient,
  walletClient,
  token,
}: {
  publicClient: TPublicClient;
  walletClient: TWalletClient;
  token: UsdDepositToken;
}) => {
  return getContract({
    abi: DEPOSIT_QUEUE_ABI,
    address: getAsyncDepositQueueContractAddress({ publicClient, token }),
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

export const getShareManagerEARNUSD = <TPublicClient extends PublicClient>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'usdShareManagerEARNUSD',
  );
  invariant(
    address,
    `no USD Share Manager contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: SHARE_MANAGER_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getCollectorContract = <TPublicClient extends PublicClient>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'usdCollector',
  );
  invariant(
    address,
    `no USD Collector contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: COLLECTOR_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};
