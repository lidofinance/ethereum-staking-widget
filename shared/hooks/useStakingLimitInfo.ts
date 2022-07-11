import { useContractSWR, useSDK, useSTETHContractRPC } from '@lido-sdk/react';

export const useStakingLimitInfo = () => {
  const { providerRpc } = useSDK();
  const steth = useSTETHContractRPC();

  const result = useContractSWR({
    shouldFetch: !!providerRpc,
    contract: steth,
    method: 'getStakeLimitFullInfo',
    params: [],
  });

  return result;
};
