import invariant from 'tiny-invariant';
import { getContract, WalletClient, type PublicClient } from 'viem';

import { getContractAddress } from 'config/networks/contract-address';
import {
  STG_DEPOSIT_QUEUE_ETH_ABI,
  STG_DEPOSIT_QUEUE_WETH_ABI,
  STG_DEPOSIT_QUEUE_WSTETH_ABI,
  STG_REDEEM_QUEUE_WSTETH_ABI,
} from './abi';

export const getSTGDepositQueueETHContract = <
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

export const getSTGDepositQueueETHWritableContract = <
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

export const getSTGDepositQueueWETHContract = <
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

export const getSTGDepositQueueWETHWritableContract = <
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

export const getSTGDepositQueueWSTETHContract = <
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

export const getSTGDepositQueueWSTETHWritableContract = <
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

export const getSTGRedeemQueueWSTETHContract = <
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

export const getSTGRedeemQueueWSTETHWritableContract = <
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
