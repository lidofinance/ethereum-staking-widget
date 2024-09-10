import { useAccount } from 'wagmi';
import { useIsContract } from 'shared/hooks';

export const useIsMultisig = () => {
  const { address } = useAccount();
  const { isContract: isMultisig, isLoading } = useIsContract(
    address ?? undefined,
  );
  return { isMultisig, isLoading };
};
