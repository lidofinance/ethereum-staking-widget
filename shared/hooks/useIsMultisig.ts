import { useAccount } from 'wagmi';
import { useIsContract } from 'shared/hooks/use-is-contract';

export const useIsMultisig = () => {
  const { address } = useAccount();
  const { data: isMultisig, isLoading } = useIsContract(address);
  return { isMultisig, isLoading };
};
