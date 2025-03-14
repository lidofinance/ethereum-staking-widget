import { isAddress } from 'viem';

const regex = new RegExp('[-a-zA-Z0-9@._]{1,256}.eth');

export const isValidEns = (ens: string) => regex.test(ens);

export const isValidAnyAddress = (input: string) =>
  isAddress(input) || isValidEns(input);
