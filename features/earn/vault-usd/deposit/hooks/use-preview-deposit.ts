import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { usePreviewDeposit } from 'modules/mellow-meta-vaults';
import { useMainnetOnlyWagmi } from 'modules/web3';
import {
  getCollectorContract,
  getSyncDepositQueueContract,
} from '../../contracts';
import { UsdDepositToken } from '../../types';

export const useUsdVaultPreviewDeposit = ({
  amount,
  token,
}: {
  amount?: bigint | null;
  token: UsdDepositToken;
}) => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');

  const collector = useMemo(
    () => getCollectorContract(publicClientMainnet),
    [publicClientMainnet],
  );
  const depositQueue = useMemo(
    () =>
      getSyncDepositQueueContract({ publicClient: publicClientMainnet, token }),
    [publicClientMainnet, token],
  );

  return usePreviewDeposit({
    collector,
    depositQueue,
    amount,
    token,
  });
};
