import { isAddress } from 'viem';

const regex = /^[-a-zA-Z0-9_.]+\.eth$/;

export const isValidEns = (ens: string) => regex.test(ens);

export const isValidAnyAddress = (input: string) =>
  isAddress(input) || isValidEns(input);
