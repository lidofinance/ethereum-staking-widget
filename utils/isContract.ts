import { type Provider } from '@ethersproject/abstract-provider';

/**
 * @deprecated only work for L1, use hooks/use-is-contract
 */
export const isContract = async (
  address: string,
  provider: Provider,
): Promise<boolean> => {
  const code = await provider.getCode(address);
  return code != '0x';
};
