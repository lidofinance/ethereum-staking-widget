import { getContractAddress } from 'config/networks/contract-address';
import { CHAINS } from 'consts/chains';

export const isGGVAvailable = (chainId: CHAINS) => {
  return !!getContractAddress(chainId, 'ggvVault');
};
