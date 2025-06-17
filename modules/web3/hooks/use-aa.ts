import { useCapabilities } from 'wagmi';
import { useDappStatus } from './use-dapp-status';

const isCapabilitySupported = (capability?: {
  supported?: boolean;
  status?: 'supported' | 'ready' | 'unsupported';
}) => {
  if (!capability) return false;

  if (typeof capability.status === 'string') {
    return capability.status != 'unsupported';
  }

  return !!capability.supported;
};

export const useAA = () => {
  const { chainId, isAccountActive } = useDappStatus();
  const capabilitiesQuery = useCapabilities({
    query: {
      enabled: isAccountActive,
    },
  });

  // merge capabilities per https://eips.ethereum.org/EIPS/eip-5792
  const capabilities = capabilitiesQuery.data
    ? {
        ...(capabilitiesQuery.data[0] ?? {}),
        ...(capabilitiesQuery.data[chainId] ?? {}),
      }
    : undefined;

  const isAtomicBatchSupported =
    isCapabilitySupported(capabilities?.atomic) ||
    // legacy
    isCapabilitySupported(capabilities?.atomicBatch);

  const areAuxiliaryFundsSupported = isCapabilitySupported(
    capabilities?.auxiliaryFunds,
  );

  // per EIP-5792 ANY successful call to getCapabilities is a sign of EIP support
  // but MM is not following the spec properly
  const isAA = capabilitiesQuery.isFetched && isAtomicBatchSupported;

  return {
    ...capabilitiesQuery,
    isAA,
    capabilities,
    isAtomicBatchSupported,
    areAuxiliaryFundsSupported,
  };
};
