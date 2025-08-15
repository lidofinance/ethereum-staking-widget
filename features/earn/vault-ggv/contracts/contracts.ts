import invariant from 'tiny-invariant';
import { getContract, WalletClient, type PublicClient } from 'viem';

import { getContractAddress } from 'config/networks/contract-address';

import {
  GGV_TELLER_ABI,
  GGV_VAULT_ABI,
  GGV_ACCOUNTANT_ABI,
  GGV_LENS_ABI,
  GGV_QUEUE_ABI,
} from './abi';

export const getGGVVaultContract = <TPublicClient extends PublicClient>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ggvVault',
  );
  invariant(
    address,
    `no GGV vault contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: GGV_VAULT_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getGGVVaultWritableContract = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ggvVault',
  );
  invariant(
    address,
    `no GGV vault contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: GGV_VAULT_ABI,
    address,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

export const getGGVTellerContract = <TPublicClient extends PublicClient>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ggvTeller',
  );
  invariant(
    address,
    `no GGV teller contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: GGV_TELLER_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getGGVTellerWritableContract = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ggvTeller',
  );
  invariant(
    address,
    `no GGV teller contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: GGV_TELLER_ABI,
    address,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

export const getGGVAccountantContract = <TPublicClient extends PublicClient>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ggvAccountant',
  );
  invariant(
    address,
    `no GGV accountant contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: GGV_ACCOUNTANT_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getGGVLensContract = <TPublicClient extends PublicClient>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ggvLens',
  );
  invariant(
    address,
    `no GGV lens contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: GGV_LENS_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getGGVQueueContract = <TPublicClient extends PublicClient>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ggvQueue',
  );
  invariant(
    address,
    `no GGV queue contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: GGV_QUEUE_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getGGVQueueWritableContract = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ggvQueue',
  );
  invariant(
    address,
    `no GGV queue contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: GGV_QUEUE_ABI,
    address,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};
