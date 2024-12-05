import { PublicClient } from 'viem';
import { getEnsAddress, normalize } from 'viem/ens';

export const resolveEns = async (
  name: string | Promise<string>,
  client: PublicClient,
): Promise<string | null> => {
  const resolvedName = typeof name === 'string' ? name : await name;
  return await getEnsAddress(client, {
    name: normalize(resolvedName),
  });
};
