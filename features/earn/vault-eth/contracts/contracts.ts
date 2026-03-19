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
import type { EthDepositToken } from '../types';
import { TOKENS } from 'consts/tokens';
import { CONTRACT_NAMES } from 'config/networks/networks-map';

export const getVaultWritableContract = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ethVault',
  );

  invariant(
    address,
    `no ETH Vault contract address for ${publicClient.chain?.id}`,
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

export const getVaultContract = <TPublicClient extends PublicClient>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ethVault',
  );

  invariant(
    address,
    `no ETH Vault contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: VAULT_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getRedeemQueueWritableContractWSTETH = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ethRedeemQueueWSTETH',
  );
  invariant(
    address,
    `no ETH Redeem Queue WSTETH contract address for ${publicClient.chain?.id}`,
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

export const getRedeemQueueContractWSTETH = <
  TPublicClient extends PublicClient,
>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ethRedeemQueueWSTETH',
  );
  invariant(
    address,
    `no ETH Redeem Queue WSTETH contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: REDEEM_QUEUE_ABI,
    address,
    client: {
      public: publicClient,
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
  token: EthDepositToken;
}) => {
  let contractName: CONTRACT_NAMES;
  switch (token) {
    case TOKENS.eth:
      contractName = 'ethSyncDepositQueueETH' as const;
      break;
    case TOKENS.weth:
      contractName = 'ethSyncDepositQueueWETH' as const;
      break;
    case TOKENS.steth:
    case TOKENS.wsteth:
      contractName = 'ethSyncDepositQueueWSTETH' as const;
      break;
    case TOKENS.gg:
      contractName = 'ethSyncDepositQueueGG' as const;
      break;
    case TOKENS.streth:
      contractName = 'ethSyncDepositQueueSTRETH' as const;
      break;
    case TOKENS.dvsteth:
      contractName = 'ethSyncDepositQueueDVSTETH' as const;
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
    `no ETH Deposit Queue ${token} contract address for ${publicClient.chain?.id}`,
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
  token: EthDepositToken;
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
  token: EthDepositToken;
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

// Returns a contract pointing to the LEGACY async deposit queue.
// Used only for reading pending state of users who deposited before the sync queue migration.
/**
 * @deprecated Use getSyncDepositQueueContractAddress instead
 */
export const getAsyncDepositQueueContractAddress = <
  TPublicClient extends PublicClient,
>({
  publicClient,
  token,
}: {
  publicClient: TPublicClient;
  token: EthDepositToken;
}) => {
  let contractName: CONTRACT_NAMES;
  switch (token) {
    case TOKENS.eth:
      contractName = 'ethDepositQueueETH' as const;
      break;
    case TOKENS.weth:
      contractName = 'ethDepositQueueWETH' as const;
      break;
    case TOKENS.steth:
    case TOKENS.wsteth:
      contractName = 'ethDepositQueueWSTETH' as const;
      break;
    case TOKENS.gg:
      contractName = 'ethDepositQueueGG' as const;
      break;
    case TOKENS.streth:
      contractName = 'ethDepositQueueSTRETH' as const;
      break;
    case TOKENS.dvsteth:
      contractName = 'ethDepositQueueDVSTETH' as const;
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
    `no async ETH Deposit Queue ${token} contract address for ${publicClient.chain?.id}`,
  );

  return address;
};

/**
 * @deprecated Use getSyncDepositQueueContract instead
 */
export const getAsyncDepositQueueContract = <
  TPublicClient extends PublicClient,
>({
  publicClient,
  token,
}: {
  publicClient: TPublicClient;
  token: EthDepositToken;
}) => {
  return getContract({
    abi: DEPOSIT_QUEUE_ABI,
    address: getAsyncDepositQueueContractAddress({ publicClient, token }),
    client: {
      public: publicClient,
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
  token: EthDepositToken;
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

export const getShareManagerContractEARNETH = <
  TPublicClient extends PublicClient,
>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ethShareManagerEARNETH',
  );
  invariant(
    address,
    `no ETH Share Manager contract address for ${publicClient.chain?.id}`,
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
    'ethCollector',
  );
  invariant(
    address,
    `no ETH Collector contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: COLLECTOR_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};
