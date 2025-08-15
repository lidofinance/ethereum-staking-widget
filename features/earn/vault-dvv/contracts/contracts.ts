import invariant from 'tiny-invariant';
import { getContract, WalletClient, type PublicClient } from 'viem';

import { getContractAddress } from 'config/networks/contract-address';

import { DVV_VAULT_ABI } from './abi';

export const getDVVVaultContract = <TPublicClient extends PublicClient>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'dvvVault',
  );
  invariant(
    address,
    `no DVV vault contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: DVV_VAULT_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getDVVaultWritableContract = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'dvvVault',
  );
  invariant(
    address,
    `no DVV vault contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: DVV_VAULT_ABI,
    address,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};
