/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useQuery } from '@tanstack/react-query';
import { useDappStatus } from 'modules/web3';
import { getGGVTellerContract } from '../../contracts';
import { usePublicClient } from 'wagmi';
import { isGGVAvailable } from '../../utils';
import invariant from 'tiny-invariant';

export const useGGVUserShareState = () => {
  const { address } = useDappStatus();
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ['ggv', 'share-state', { address }],
    enabled: address && isGGVAvailable(publicClient!.chain.id),
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
