import { Address, sha256, stringToBytes } from 'viem';

export type AddressValidationFile = {
  addresses: Set<string>;
  isBroken?: boolean;
};

const hashAddress = (address: string): string =>
  sha256(stringToBytes(address.toLowerCase())).slice(2);

export const validateAddressLocally = (
  address: Address,
  validationFile: AddressValidationFile,
): { isValid: boolean } => {
  if (!address) return { isValid: true };

  const normalizedAddress = address.toLowerCase();
  const isNotValid =
    validationFile.addresses.has(hashAddress(normalizedAddress)) ||
    // legacy support for plain addresses in the file (0x-prefixed, 42 chars)
    validationFile.addresses.has(normalizedAddress);

  return {
    isValid: !isNotValid,
  };
};
