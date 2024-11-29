import { useIsContract } from './use-is-contract';
import { useDappStatus } from './use-dapp-status';
import { useAA } from './use-aa';

export const useIsMultisig = () => {
  const { address } = useDappStatus();
  const { isAA, isLoading: isAALoading } = useAA();
  const { data: isMultisig, isLoading: isContractLoading } =
    useIsContract(address);
  return {
    isAA,
    isMultisig: isAA || isMultisig,
    isLoading: isContractLoading || isAALoading,
  };
};
