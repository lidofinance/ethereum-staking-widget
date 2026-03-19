import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { usePreviewDeposit } from 'modules/mellow-meta-vaults';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { useWstethBySteth } from 'modules/web3/hooks/use-wstETH-by-stETH';
import { TOKENS } from 'consts/tokens';
import {
  getCollectorContract,
  getSyncDepositQueueContract,
} from '../../contracts';
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

  const isSteth = token === TOKENS.steth;

  // For stETH deposits the queue actually receives wstETH,
  // so convert the input amount before calling the collector.
  const { data: wstethAmount } = useWstethBySteth(isSteth ? amount : undefined);

  const previewAmount = isSteth
    ? wstethAmount ?? null // null while converting keeps the preview disabled
    : amount;
  const previewToken: EthDepositToken = isSteth ? TOKENS.wsteth : token;

  const collector = useMemo(
    () => getCollectorContract(publicClientMainnet),
    [publicClientMainnet],
  );
  const depositQueue = useMemo(
    () =>
      getSyncDepositQueueContract({
        publicClient: publicClientMainnet,
        token: previewToken,
      }),
    [publicClientMainnet, previewToken],
  );

  return usePreviewDeposit({
    collector,
    depositQueue,
    amount: previewAmount,
    token: previewToken,
  });
};
