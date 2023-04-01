import { type Provider } from '@ethersproject/abstract-provider';

export const isContract = async (
  address: string,
  provider: Provider,
): Promise<boolean> => {
  const code = await provider.getCode(address);
  if (code != '0x') return true;
  return false;
};
