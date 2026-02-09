import invariant from 'tiny-invariant';
import { getContract, WalletClient, type PublicClient } from 'viem';

import { getContractAddress } from 'config/networks/contract-address';
import {
  ETH_VAULT_ABI,
  ETH_COLLECTOR_ABI,
  ETH_DEPOSIT_QUEUE_ETH_ABI,
  ETH_DEPOSIT_QUEUE_WETH_ABI,
  ETH_DEPOSIT_QUEUE_WSTETH_ABI,
  ETH_REDEEM_QUEUE_WSTETH_ABI,
  ETH_SHARE_MANAGER_EARNETH_ABI,
} from './abi';
import { ETH_DEPOSIT_TOKENS } from '../deposit/form-context/types';
import { ETH_DEPOSIT_QUEUE_GG_ABI } from './abi/eth-deposit-queue-gg';
import { ETH_DEPOSIT_QUEUE_STRETH_ABI } from './abi/eth-deposit-queue-streth';
import { ETH_DEPOSIT_QUEUE_DVSTETH_ABI } from './abi/eth-deposit-queue-dvsteth';

export const getETHVaultContract = <TPublicClient extends PublicClient>(
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
    abi: ETH_VAULT_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getETHVaultWritableContract = <
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
    abi: ETH_VAULT_ABI,
    address,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

export const getETHDepositQueueContractETH = <
  TPublicClient extends PublicClient,
>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ethDepositQueueETH',
  );
  invariant(
    address,
    `no ETH Deposit Queue ETH contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: ETH_DEPOSIT_QUEUE_ETH_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getETHDepositQueueWritableContractETH = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ethDepositQueueETH',
  );
  invariant(
    address,
    `no ETH Deposit Queue ETH contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: ETH_DEPOSIT_QUEUE_ETH_ABI,
    address,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

export const getETHDepositQueueContractWETH = <
  TPublicClient extends PublicClient,
>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ethDepositQueueWETH',
  );
  invariant(
    address,
    `no ETH Deposit Queue WETH contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: ETH_DEPOSIT_QUEUE_WETH_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getETHDepositQueueWritableContractWETH = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ethDepositQueueWETH',
  );
  invariant(
    address,
    `no ETH Deposit Queue WETH contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: ETH_DEPOSIT_QUEUE_WETH_ABI,
    address,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

export const getETHDepositQueueContractWSTETH = <
  TPublicClient extends PublicClient,
>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ethDepositQueueWSTETH',
  );
  invariant(
    address,
    `no ETH Deposit Queue WSTETH contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: ETH_DEPOSIT_QUEUE_WSTETH_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getETHDepositQueueWritableContractWSTETH = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ethDepositQueueWSTETH',
  );
  invariant(
    address,
    `no ETH Deposit Queue WSTETH contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: ETH_DEPOSIT_QUEUE_WSTETH_ABI,
    address,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

export const getETHDepositQueueContractGG = <
  TPublicClient extends PublicClient,
>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ethDepositQueueGG',
  );
  invariant(
    address,
    `no ETH Deposit Queue GG contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: ETH_DEPOSIT_QUEUE_GG_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getETHDepositQueueWritableContractGG = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ethDepositQueueGG',
  );
  invariant(
    address,
    `no ETH Deposit Queue GG contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: ETH_DEPOSIT_QUEUE_GG_ABI,
    address,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

export const getETHDepositQueueContractSTRETH = <
  TPublicClient extends PublicClient,
>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ethDepositQueueSTRETH',
  );
  invariant(
    address,
    `no ETH Deposit Queue STRETH contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: ETH_DEPOSIT_QUEUE_STRETH_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getETHDepositQueueWritableContractSTRETH = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ethDepositQueueSTRETH',
  );
  invariant(
    address,
    `no ETH Deposit Queue STRETH contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: ETH_DEPOSIT_QUEUE_STRETH_ABI,
    address,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

export const getETHDepositQueueContractDVSTETH = <
  TPublicClient extends PublicClient,
>(
  publicClient: TPublicClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ethDepositQueueDVSTETH',
  );
  invariant(
    address,
    `no ETH Deposit Queue DVSTETH contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: ETH_DEPOSIT_QUEUE_DVSTETH_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getETHDepositQueueWritableContractDVSTETH = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>(
  publicClient: TPublicClient,
  walletClient: TWalletClient,
) => {
  const address = getContractAddress(
    publicClient.chain?.id as number,
    'ethDepositQueueDVSTETH',
  );
  invariant(
    address,
    `no ETH Deposit Queue DVSTETH contract address for ${publicClient.chain?.id}`,
  );

  return getContract({
    abi: ETH_DEPOSIT_QUEUE_DVSTETH_ABI,
    address,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

export const getETHRedeemQueueContractWSTETH = <
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
    abi: ETH_REDEEM_QUEUE_WSTETH_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getETHRedeemQueueWritableContractWSTETH = <
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
    abi: ETH_REDEEM_QUEUE_WSTETH_ABI,
    address,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
};

export const getETHDepositQueueContract = <TPublicClient extends PublicClient>({
  publicClient,
  token,
}: {
  publicClient: TPublicClient;
  token: ETH_DEPOSIT_TOKENS;
}) => {
  let contract;
  switch (token) {
    case 'ETH':
      contract = getETHDepositQueueContractETH(publicClient);
      break;
    case 'wETH':
      contract = getETHDepositQueueContractWETH(publicClient);
      break;
    case 'wstETH':
      contract = getETHDepositQueueContractWSTETH(publicClient);
      break;
    case 'GG':
      contract = getETHDepositQueueContractGG(publicClient);
      break;
    case 'strETH':
      contract = getETHDepositQueueContractSTRETH(publicClient);
      break;
    case 'DVstETH':
      contract = getETHDepositQueueContractDVSTETH(publicClient);
      break;
    default:
      throw new Error(`Unsupported token: ${token}`);
  }
  return contract;
};

export const getETHDepositQueueWritableContract = <
  TPublicClient extends PublicClient,
  TWalletClient extends WalletClient = WalletClient,
>({
  publicClient,
  walletClient,
  token,
}: {
  publicClient: TPublicClient;
  walletClient: TWalletClient;
  token: ETH_DEPOSIT_TOKENS;
}) => {
  let contract;
  switch (token) {
    case 'ETH':
      contract = getETHDepositQueueWritableContractETH(
        publicClient,
        walletClient,
      );
      break;
    case 'wETH':
      contract = getETHDepositQueueWritableContractWETH(
        publicClient,
        walletClient,
      );
      break;
    case 'wstETH':
      contract = getETHDepositQueueWritableContractWSTETH(
        publicClient,
        walletClient,
      );
      break;
    case 'GG':
      contract = getETHDepositQueueWritableContractGG(
        publicClient,
        walletClient,
      );
      break;
    case 'strETH':
      contract = getETHDepositQueueWritableContractSTRETH(
        publicClient,
        walletClient,
      );
      break;
    case 'DVstETH':
      contract = getETHDepositQueueWritableContractDVSTETH(
        publicClient,
        walletClient,
      );
      break;
    default:
      throw new Error(`Unsupported token: ${token}`);
  }
  return contract;
};

export const getETHShareManagerEARNETH = <TPublicClient extends PublicClient>(
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
    abi: ETH_SHARE_MANAGER_EARNETH_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};

export const getETHCollectorContract = <TPublicClient extends PublicClient>(
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
    abi: ETH_COLLECTOR_ABI,
    address,
    client: {
      public: publicClient,
    },
  });
};
