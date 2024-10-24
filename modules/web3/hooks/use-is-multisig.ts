import { useIsContract } from './use-is-contract';
import { useDappStatus } from './use-dapp-status';

export const useIsMultisig = () => {
  const { address } = useDappStatus();
  const { data: isMultisig, isLoading } = useIsContract(address);
  return { isMultisig, isLoading };
};
