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
import type { EthDepositTokens } from '../types';

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

export const getDepositQueueContractAddress = <
  TPublicClient extends PublicClient,
>({
  publicClient,
  token,
}: {
  publicClient: TPublicClient;
  token: EthDepositTokens;
}) => {
  let contractName;
  switch (token) {
    case 'ETH':
      contractName = 'ethDepositQueueETH' as const;
      break;
    case 'wETH':
      contractName = 'ethDepositQueueWETH' as const;
      break;
    case 'wstETH':
      contractName = 'ethDepositQueueWSTETH' as const;
      break;
    case 'GG':
      contractName = 'ethDepositQueueGG' as const;
      break;
    case 'strETH':
      contractName = 'ethDepositQueueSTRETH' as const;
      break;
    case 'DVstETH':
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
    `no ETH Deposit Queue ${token} contract address for ${publicClient.chain?.id}`,
  );
  return address;
};

export const getDepositQueueContract = <TPublicClient extends PublicClient>({
  publicClient,
  token,
}: {
  publicClient: TPublicClient;
  token: EthDepositTokens;
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
  token: EthDepositTokens;
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
