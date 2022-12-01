import { ethers } from 'ethers';

const regex = new RegExp('[-a-zA-Z0-9@._]{1,256}.eth');

export const isValidAddress = (address: string) =>
  ethers.utils.isAddress(address);

export const isValidEns = (ens: string) => regex.test(ens);

export const isValidAnyAddress = (input: string) =>
  isValidAddress(input) || isValidEns(input);
