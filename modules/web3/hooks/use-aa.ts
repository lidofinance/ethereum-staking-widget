import { useCapabilities } from 'wagmi/experimental';
import { useDappStatus } from './use-dapp-status';

const retry = (retryCount: number, error: object) => {
  if (
    'code' in error &&
    typeof error.code === 'number' &&
    error.code === -32601
  )
    return false;
  return retryCount <= 3;
};

export const useAA = () => {
  const { chainId } = useDappStatus();
  const capabilitiesQuery = useCapabilities({
    query: {
      retry,
    },
  });

  const capabilities =
    capabilitiesQuery.data && capabilitiesQuery.data[chainId];

  const isAA = !!capabilities;

  return { ...capabilitiesQuery, isAA, capabilities };
};
