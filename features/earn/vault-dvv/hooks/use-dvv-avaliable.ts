import { getContractAddress } from 'config/networks/contract-address';
import { useDappStatus } from 'modules/web3';

export const useDVVAvailable = () => {
  const { chainId } = useDappStatus();

  return { isDVVAvailable: !!getContractAddress(chainId, 'dvvVault') };
};
