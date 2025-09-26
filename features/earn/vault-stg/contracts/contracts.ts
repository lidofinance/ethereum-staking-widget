import invariant from 'tiny-invariant';
import { getContract, WalletClient, type PublicClient } from 'viem';

import { getContractAddress } from 'config/networks/contract-address';
import {
  STG_VAULT_ABI,
  STG_COLLECTOR_ABI,
  STG_DEPOSIT_QUEUE_ETH_ABI,
  STG_DEPOSIT_QUEUE_WETH_ABI,
  STG_DEPOSIT_QUEUE_WSTETH_ABI,
  STG_REDEEM_QUEUE_WSTETH_ABI,
  STG_SHARE_MANAGER_STRETH_ABI,
} from './abi';
import { STG_DEPOSIT_TOKENS } from '../deposit/form-context/types';

export const getSTGVaultContract = <TPublicClient extends PublicClient>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'stgVault',
  );
  invariant(
    address,
    `no STG Vault contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: STG_VAULT_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getSTGVaultWritableContract = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'stgVault',
  );
  invariant(
    address,
    `no STG Vault contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: STG_VAULT_ABI,
    address,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

export const getSTGDepositQueueContractETH = <
  TPublicClient extends PublicClient,
>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'stgDepositQueueETH',
  );
  invariant(
    address,
    `no STG Deposit Queue ETH contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: STG_DEPOSIT_QUEUE_ETH_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getSTGDepositQueueWritableContractETH = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'stgDepositQueueETH',
  );
  invariant(
    address,
    `no STG Deposit Queue ETH contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: STG_DEPOSIT_QUEUE_ETH_ABI,
    address,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

export const getSTGDepositQueueContractWETH = <
  TPublicClient extends PublicClient,
>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'stgDepositQueueWETH',
  );
  invariant(
    address,
    `no STG Deposit Queue WETH contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: STG_DEPOSIT_QUEUE_WETH_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getSTGDepositQueueWritableContractWETH = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'stgDepositQueueWETH',
  );
  invariant(
    address,
    `no STG Deposit Queue WETH contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: STG_DEPOSIT_QUEUE_WETH_ABI,
    address,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

export const getSTGDepositQueueContractWSTETH = <
  TPublicClient extends PublicClient,
>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'stgDepositQueueWSTETH',
  );
  invariant(
    address,
    `no STG Deposit Queue WSTETH contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: STG_DEPOSIT_QUEUE_WSTETH_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getSTGDepositQueueWritableContractWSTETH = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'stgDepositQueueWSTETH',
  );
  invariant(
    address,
    `no STG Deposit Queue WSTETH contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: STG_DEPOSIT_QUEUE_WSTETH_ABI,
    address,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

export const getSTGRedeemQueueContractWSTETH = <
  TPublicClient extends PublicClient,
>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'stgRedeemQueueWSTETH',
  );
  invariant(
    address,
    `no STG Redeem Queue WSTETH contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: STG_REDEEM_QUEUE_WSTETH_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getSTGRedeemQueueWritableContractWSTETH = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'stgRedeemQueueWSTETH',
  );
  invariant(
    address,
    `no STG Redeem Queue WSTETH contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: STG_REDEEM_QUEUE_WSTETH_ABI,
    address,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

export const getSTGDepositQueueContract = <TPublicClient extends PublicClient>({
  publicClient,
  token,
}: {
  publicClient: TPublicClient;
  token: STG_DEPOSIT_TOKENS;
}) => {
  let contract;
  switch (token) {
    case 'ETH':
      contract = getSTGDepositQueueContractETH(publicClient);
      break;
    case 'wETH':
      contract = getSTGDepositQueueContractWETH(publicClient);
      break;
    case 'wstETH':
      contract = getSTGDepositQueueContractWSTETH(publicClient);
      break;
    default:
      throw new Error(`Unsupported token: ${token}`);
  }
  return contract;
};

export const getSTGDepositQueueWritableContract = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>({
  publicClient,
  walletClient,
  token,
}: {
  publicClient: TPublicClient;
  walletClient: TWalletClient;
  token: STG_DEPOSIT_TOKENS;
}) => {
  let contract;
  switch (token) {
    case 'ETH':
      contract = getSTGDepositQueueWritableContractETH(
        publicClient,
        walletClient,
      );
      break;
    case 'wETH':
      contract = getSTGDepositQueueWritableContractWETH(
        publicClient,
        walletClient,
      );
      break;
    case 'wstETH':
      contract = getSTGDepositQueueWritableContractWSTETH(
        publicClient,
        walletClient,
      );
      break;
    default:
      throw new Error(`Unsupported token: ${token}`);
  }
  return contract;
};

export const getSTGShareManagerSTRETH = <TPublicClient extends PublicClient>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'stgShareManagerSTRETH',
  );
  invariant(
    address,
    `no STG Share Manager contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: STG_SHARE_MANAGER_STRETH_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getSTGCollectorContract = <TPublicClient extends PublicClient>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'stgCollector',
  );
  invariant(
    address,
    `no STG Collector contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: STG_COLLECTOR_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};
