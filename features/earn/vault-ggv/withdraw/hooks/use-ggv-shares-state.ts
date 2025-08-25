/* eslint-disable @typescript-eslint/no-non-null-assertion */
import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { useDappStatus } from 'modules/web3';

import { getGGVTellerContract } from '../../contracts';
import { useGGVAvailable } from '../../hooks/use-ggv-available';

export const useGGVUserShareState = () => {
  const { address } = useDappStatus();
  const publicClient = usePublicClient();
  const { isGGVAvailable } = useGGVAvailable();

  return useQuery({
    queryKey: ['ggv', 'share-state', { address }],
    enabled: address && isGGVAvailable,
    queryFn: async () => {
      invariant(publicClient);
      invariant(address);
      const teller = getGGVTellerContract(publicClient);
      const [
        denyFrom,
        denyTo,
        denyOperator,
        permissionedOperator,
        shareUnlockTime,
      ] = await teller.read.beforeTransferData([address]);

      return {
        denyFrom,
        denyTo,
        denyOperator,
        permissionedOperator,
        shareUnlockTime,
      };
    },
  });
};
