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

import { USD_DEPOSIT_TOKENS } from '../deposit/form-context/types';

export const getUSDVaultContract = <TPublicClient extends PublicClient>(
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

export const getUSDVaultWritableContract = <
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

export const getUSDDepositQueueContractUSDT = <
  TPublicClient extends PublicClient,
>(
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

export const getUSDDepositQueueWritableContractUSDT = <
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

export const getUSDDepositQueueContractUSDC = <
  TPublicClient extends PublicClient,
>(
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

export const getUSDDepositQueueWritableContractUSDC = <
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

export const getUSDRedeemQueueContractUSDC = <
  TPublicClient extends PublicClient,
>(
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

export const getUSDRedeemQueueWritableContractUSDC = <
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

export const getUSDDepositQueueContract = <TPublicClient extends PublicClient>({
  publicClient,
  token,
}: {
  publicClient: TPublicClient;
  token: USD_DEPOSIT_TOKENS;
}) => {
  let contract;
  switch (token) {
    case 'USDT':
      contract = getUSDDepositQueueContractUSDT(publicClient);
      break;
    case 'USDC':
      contract = getUSDDepositQueueContractUSDC(publicClient);
      break;
    default:
      throw new Error(`Unsupported token: ${token}`);
  }
  return contract;
};

export const getUSDDepositQueueWritableContract = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>({
  publicClient,
  walletClient,
  token,
}: {
  publicClient: TPublicClient;
  walletClient: TWalletClient;
  token: USD_DEPOSIT_TOKENS;
}) => {
  let contract;
  switch (token) {
    case 'USDT':
      contract = getUSDDepositQueueWritableContractUSDT(
        publicClient,
        walletClient,
      );
      break;
    case 'USDC':
      contract = getUSDDepositQueueWritableContractUSDC(
        publicClient,
        walletClient,
      );
      break;
    default:
      throw new Error(`Unsupported token: ${token}`);
  }
  return contract;
};

export const getUSDShareManagerEARNUSD = <TPublicClient extends PublicClient>(
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

export const getUSDCollectorContract = <TPublicClient extends PublicClient>(
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
