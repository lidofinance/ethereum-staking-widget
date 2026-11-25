import invariant from 'tiny-invariant';
import { getContract, WalletClient, type PublicClient } from 'viem';

import { getContractAddress } from 'config/networks/contract-address';
import {
  ASYNC_REDEEM_QUEUE_ABI,
  COLLECTOR_ABI,
  DEPOSIT_QUEUE_ABI,
  ORACLE_ABI,
  SHARE_MANAGER_ABI,
  SYNC_DEPOSIT_QUEUE_ABI,
  SYNC_REDEEM_QUEUE_ABI,
  VAULT_ABI,
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
    abi: ASYNC_REDEEM_QUEUE_ABI,
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
    abi: ASYNC_REDEEM_QUEUE_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getSyncRedeemQueueWritableContractWSTETH = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ethSyncRedeemQueueWSTETH',
  );
  invariant(
    address,
    `no ETH Sync Redeem Queue WSTETH contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: SYNC_REDEEM_QUEUE_ABI,
    address,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

// The vault's oracle, whose report the sync redeem queue prices with. A
// configured address rather than `vault.oracle()`: the RPC proxy only serves
// eth_call to configured contracts, a runtime-resolved address would be
// rejected and fall through to the public RPC
export const getOracleContract = <TPublicClient extends PublicClient>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ethOracle',
  );
  invariant(
    address,
    `no ETH Vault Oracle contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: ORACLE_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getSyncRedeemQueueContractWSTETH = <
  TPublicClient extends PublicClient,
>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ethSyncRedeemQueueWSTETH',
  );
  invariant(
    address,
    `no ETH Sync Redeem Queue WSTETH contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: SYNC_REDEEM_QUEUE_ABI,
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
      contractName = 'ethSyncDepositQueueETH';
      break;
    case TOKENS.weth:
      contractName = 'ethSyncDepositQueueWETH';
      break;
    case TOKENS.steth:
    case TOKENS.wsteth:
      contractName = 'ethSyncDepositQueueWSTETH';
      break;
    case TOKENS.gg:
      contractName = 'ethSyncDepositQueueGG';
      break;
    case TOKENS.streth:
      contractName = 'ethSyncDepositQueueSTRETH';
      break;
    case TOKENS.dvsteth:
      contractName = 'ethSyncDepositQueueDVSTETH';
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

// The LEGACY async deposit queues: deposits go through the sync queues now.
// Kept for users who deposited before the migration: reading their pending
// request (the sync queue has no `requestOf`) and cancelling it
const getLegacyAsyncDepositQueueContractAddress = <
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
      contractName = 'ethDepositQueueETH';
      break;
    case TOKENS.weth:
      contractName = 'ethDepositQueueWETH';
      break;
    case TOKENS.steth:
    case TOKENS.wsteth:
      contractName = 'ethDepositQueueWSTETH';
      break;
    case TOKENS.gg:
      contractName = 'ethDepositQueueGG';
      break;
    case TOKENS.streth:
      contractName = 'ethDepositQueueSTRETH';
      break;
    case TOKENS.dvsteth:
      contractName = 'ethDepositQueueDVSTETH';
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
 * Read access to a token's LEGACY async deposit queue, for the pending
 * requests of users who deposited before the sync queue migration. Not for
 * new deposits: those go through getSyncDepositQueueWritableContract
 */
export const getLegacyAsyncDepositQueueContract = <
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
    address: getLegacyAsyncDepositQueueContractAddress({ publicClient, token }),
    client: {
      public: publicClient,
    },
  });
};

/**
 * Write access to a token's LEGACY async deposit queue, only to cancel a
 * pending request made before the sync queue migration
 */
export const getLegacyAsyncDepositQueueWritableContract = <
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
    address: getLegacyAsyncDepositQueueContractAddress({ publicClient, token }),
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
