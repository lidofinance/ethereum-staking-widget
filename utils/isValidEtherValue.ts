import { parseEther } from '@ethersproject/units';

export const isValidEtherValue = (value: string) => {
  try {
    parseEther(value);
  } catch {
    return false;
  }

  return true;
};
