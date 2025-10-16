import { ESTIMATE_AMOUNT, useMainnetOnlyWagmi } from 'modules/web3';
import { useEstimateGas } from 'wagmi';
import { getGGVTellerContract } from '../../contracts';
import { encodeFunctionData } from 'viem';
import { getTokenAddress } from 'config/networks/token-address';
import { useMemo } from 'react';
import invariant from 'tiny-invariant';
import { ESTIMATE_ACCOUNT } from 'config/groups/web3';
import { LIDO_ADDRESS } from 'config/groups/stake';

export const useGGVDepositEthGasLimit = () => {
  const { mainnetConfig, publicClientMainnet } = useMainnetOnlyWagmi();

  const estimateArgs = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ethAddress = getTokenAddress(publicClientMainnet.chain!.id, 'ETH');
    const teller = getGGVTellerContract(publicClientMainnet);
    invariant(ethAddress);
    return {
      data: encodeFunctionData({
        abi: teller.abi,
        functionName: 'deposit',
        args: [ethAddress, ESTIMATE_AMOUNT, 0n, LIDO_ADDRESS],
      }),
      value: ESTIMATE_AMOUNT,
      to: teller.address,
      account: ESTIMATE_ACCOUNT,
    };
  }, [publicClientMainnet]);

  return useEstimateGas({
    config: mainnetConfig,
    ...estimateArgs,
  });
};
