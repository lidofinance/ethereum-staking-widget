import invariant from 'tiny-invariant';
import { getContract, WalletClient, type PublicClient } from 'viem';

import { getContractAddress } from 'config/networks/contract-address';
import {
  VAULT_ABI,
  COLLECTOR_ABI,
  DEPOSIT_QUEUE_ABI,
  SYNC_DEPOSIT_QUEUE_ABI,
  ASYNC_REDEEM_QUEUE_ABI,
  SHARE_MANAGER_ABI,
  SYNC_REDEEM_QUEUE_ABI,
} from 'modules/mellow-meta-vaults/abi';
import { TOKENS } from 'consts/tokens';
import { CONTRACT_NAMES } from 'config/networks/networks-map';

import type { UsdDepositToken, UsdWithdrawToken } from '../types';

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

export const USD_ASYNC_REDEEM_QUEUE_CONTRACT_NAMES: Record<
  UsdWithdrawToken,
  CONTRACT_NAMES
> = {
  [TOKENS.usdc]: 'usdRedeemQueueUSDC',
  [TOKENS.usdt]: 'usdRedeemQueueUSDT',
};

// USDT is async-only: Mellow provides no sync (instant) redeem queue for it.
// The absence of a name here is what makes the instant route unreachable for USDT.
export const USD_SYNC_REDEEM_QUEUE_CONTRACT_NAMES: Partial<
  Record<UsdWithdrawToken, CONTRACT_NAMES>
> = {
  [TOKENS.usdc]: 'usdSyncRedeemQueueUSDC',
};

export const getRedeemQueueContractAddress = <
  TPublicClient extends PublicClient,
>({
  publicClient,
  token,
}: {
  publicClient: TPublicClient;
  token: UsdWithdrawToken;
}) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    USD_ASYNC_REDEEM_QUEUE_CONTRACT_NAMES[token],
  );
  invariant(
    address,
    `no USD Redeem Queue ${token} contract address for ${publicClient.chain?.id}`,
  );
  return address;
};

export const getRedeemQueueContract = <TPublicClient extends PublicClient>({
  publicClient,
  token,
}: {
  publicClient: TPublicClient;
  token: UsdWithdrawToken;
}) => {
  return getContract({
    abi: ASYNC_REDEEM_QUEUE_ABI,
    address: getRedeemQueueContractAddress({ publicClient, token }),
    client: {
      public: publicClient,
    },
  });
};

export const getRedeemQueueWritableContract = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>({
  publicClient,
  walletClient,
  token,
}: {
  publicClient: TPublicClient;
  walletClient: TWalletClient;
  token: UsdWithdrawToken;
}) => {
  return getContract({
    abi: ASYNC_REDEEM_QUEUE_ABI,
    address: getRedeemQueueContractAddress({ publicClient, token }),
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

// Returns undefined when the token has no sync queue (USDT) — "no instant route"
// is a valid state that callers branch on, not an error.
const getSyncRedeemQueueContractAddress = <TPublicClient extends PublicClient>({
  publicClient,
  token,
}: {
  publicClient: TPublicClient;
  token: UsdWithdrawToken;
}) => {
  const contractName = USD_SYNC_REDEEM_QUEUE_CONTRACT_NAMES[token];
  if (!contractName) return undefined;

  const address = getContractAddress(
    publicClient.chain?.id as number,
    contractName,
  );
  invariant(
    address,
    `no USD Sync Redeem Queue ${token} contract address for ${publicClient.chain?.id}`,
  );
  return address;
};

export const getSyncRedeemQueueContract = <TPublicClient extends PublicClient>({
  publicClient,
  token,
}: {
  publicClient: TPublicClient;
  token: UsdWithdrawToken;
}) => {
  const address = getSyncRedeemQueueContractAddress({ publicClient, token });
  if (!address) return undefined;

  return getContract({
    abi: SYNC_REDEEM_QUEUE_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getSyncRedeemQueueWritableContract = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>({
  publicClient,
  walletClient,
  token,
}: {
  publicClient: TPublicClient;
  walletClient: TWalletClient;
  token: UsdWithdrawToken;
}) => {
  const address = getSyncRedeemQueueContractAddress({ publicClient, token });
  if (!address) return undefined;

  return getContract({
    abi: SYNC_REDEEM_QUEUE_ABI,
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
  let contractName: CONTRACT_NAMES;
  switch (token) {
    case TOKENS.usdt:
      contractName = 'usdSyncDepositQueueUSDT';
      break;
    case TOKENS.usdc:
      contractName = 'usdSyncDepositQueueUSDC';
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
  let contractName: CONTRACT_NAMES;
  switch (token) {
    case TOKENS.usdt:
      contractName = 'usdDepositQueueUSDT';
      break;
    case TOKENS.usdc:
      contractName = 'usdDepositQueueUSDC';
      break;
    case TOKENS.usde:
      contractName = 'usdDepositQueueUSDE';
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

export const getDepositQueueContract = <TPublicClient extends PublicClient>({
  publicClient,
  token,
}: {
  publicClient: TPublicClient;
  token: UsdDepositToken;
}) => {
  if (token === TOKENS.usde) {
    return getContract({
      abi: DEPOSIT_QUEUE_ABI,
      address: getAsyncDepositQueueContractAddress({ publicClient, token }),
      client: {
        public: publicClient,
      },
    });
  }

  return getSyncDepositQueueContract({ publicClient, token });
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

export const getDepositQueueWritableContract = <
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
  if (token === TOKENS.usde) {
    return getAsyncDepositQueueWritableContract({
      publicClient,
      walletClient,
      token,
    });
  }

  return getSyncDepositQueueWritableContract({
    publicClient,
    walletClient,
    token,
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
