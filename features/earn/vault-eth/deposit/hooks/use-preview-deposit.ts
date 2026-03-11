import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { usePreviewDeposit } from 'modules/mellow-meta-vaults';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { getCollectorContract, getDepositQueueContract } from '../../contracts';
import { EthDepositToken } from '../../types';

export const useEthVaultPreviewDeposit = ({
  amount,
  token,
}: {
  amount?: bigint | null;
  token: EthDepositToken;
}) => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');

  const collector = useMemo(
    () => getCollectorContract(publicClientMainnet),
    [publicClientMainnet],
  );
  const depositQueue = useMemo(
    () => getDepositQueueContract({ publicClient: publicClientMainnet, token }),
    [publicClientMainnet, token],
  );

  return usePreviewDeposit({
    collector,
    depositQueue,
    amount,
    token,
  });
};
