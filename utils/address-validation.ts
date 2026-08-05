import { Address, sha256, stringToBytes } from 'viem';

export interface AddressValidationFile {
  addresses: string[];
  isBroken?: boolean;
}

// 64-hex entry = sha256(lowercase address incl. 0x): the helm chart hashes
// the plain list at template render time (sprig `sha256sum`), dev builds in
// scripts/write-window-env.mjs — pods and browsers only ever see hashes.
// 0x-prefixed 42-char entries are plain addresses (legacy files still work).
const SHA256_HEX_RE = /^[0-9a-f]{64}$/;

const hashAddress = (address: string): string =>
  sha256(stringToBytes(address.toLowerCase())).slice(2);

export const validateAddressLocally = (
  address: Address,
  validationFile: AddressValidationFile,
): { isValid: boolean } => {
  if (!address) return { isValid: true };

  const normalizedAddress = address.toLowerCase();
  // lazily computed: plain-address-only files never pay for hashing
  let hashedAddress: string | null = null;

  const isNotValid = validationFile.addresses.some((entry) => {
    const normalizedEntry = entry.toLowerCase();
    if (SHA256_HEX_RE.test(normalizedEntry)) {
      hashedAddress ??= hashAddress(normalizedAddress);
      return normalizedEntry === hashedAddress;
    }
    return normalizedEntry === normalizedAddress;
  });

  return {
    isValid: !isNotValid,
  };
};
