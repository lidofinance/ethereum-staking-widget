import invariant from 'tiny-invariant';
import { getContract, WalletClient, type PublicClient } from 'viem';

import { getContractAddress } from 'config/networks/contract-address';
import {
  VAULT_ABI,
  COLLECTOR_ABI,
  DEPOSIT_QUEUE_ABI,
  REDEEM_QUEUE_ABI,
  SHARE_MANAGER_ABI,
} from 'modules/mellow-meta-vaults/abi';
import { TOKEN_SYMBOLS } from 'consts/tokens';
import type { UsdDepositTokens } from '../types';

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

export const getDepositQueueContractUSDT = <TPublicClient extends PublicClient>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'usdDepositQueueUSDT',
  );
  invariant(
    address,
    `no USD Deposit Queue USDT contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: DEPOSIT_QUEUE_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getDepositQueueWritableContractUSDT = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'usdDepositQueueUSDT',
  );
  invariant(
    address,
    `no USD Deposit Queue USDT contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: DEPOSIT_QUEUE_ABI,
    address,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

export const getDepositQueueContractUSDC = <TPublicClient extends PublicClient>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'usdDepositQueueUSDC',
  );
  invariant(
    address,
    `no USD Deposit Queue USDC contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: DEPOSIT_QUEUE_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getDepositQueueWritableContractUSDC = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'usdDepositQueueUSDC',
  );
  invariant(
    address,
    `no USD Deposit Queue USDC contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: DEPOSIT_QUEUE_ABI,
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

export const getDepositQueueContractAddress = <
  TPublicClient extends PublicClient,
>({
  publicClient,
  token,
}: {
  publicClient: TPublicClient;
  token: UsdDepositTokens;
}) => {
  let contractName;
  switch (token) {
    case TOKEN_SYMBOLS.usdt:
      contractName = 'usdDepositQueueUSDT' as const;
      break;
    case TOKEN_SYMBOLS.usdc:
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
    `no USD Deposit Queue ${token} contract address for ${publicClient.chain?.id}`,
  );
  return address;
};

export const getDepositQueueContract = <TPublicClient extends PublicClient>({
  publicClient,
  token,
}: {
  publicClient: TPublicClient;
  token: UsdDepositTokens;
}) => {
  return getContract({
    abi: DEPOSIT_QUEUE_ABI,
    address: getDepositQueueContractAddress({ publicClient, token }),
    client: {
      public: publicClient,
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
  token: UsdDepositTokens;
}) => {
  return getContract({
    abi: DEPOSIT_QUEUE_ABI,
    address: getDepositQueueContractAddress({ publicClient, token }),
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
