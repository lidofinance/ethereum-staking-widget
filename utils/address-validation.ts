import { Address } from 'viem';

export interface AddressValidationFile {
  addresses: string[];
  isBrocken?: boolean;
}

export const validateAddressLocally = (
  address: Address,
  validationFile: AddressValidationFile,
): { isValid: boolean } => {
  if (!address) return { isValid: true };

  const normalizedAddress = address.toLowerCase();

  const isNotValid = validationFile.addresses.some(
    (addr) => addr.toLowerCase() === normalizedAddress,
  );

  return {
    isValid: !isNotValid,
  };
};
