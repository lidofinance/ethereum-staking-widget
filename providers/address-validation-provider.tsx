import {
  ReactNode,
  useEffect,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

import { useQuery } from '@tanstack/react-query';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useAccount } from 'wagmi';
import { useForceDisconnect } from 'reef-knot/core-react';
import { config } from 'config';
import invariant from 'tiny-invariant';
import {
  AddressValidationFile,
  validateAddressLocally,
} from 'utils/address-validation';
import { useApiAddressValidation } from 'shared/hooks/use-api-address-validation';

const AddressValidationContext = createContext<{
  validationResult: {
    isValid: boolean;
  };
  isNotValidAddress: boolean;
  setIsNotValidAddress: (show: boolean) => void;
}>({
  validationResult: {
    isValid: true,
  },
  isNotValidAddress: false,
  setIsNotValidAddress: () => {},
});
AddressValidationContext.displayName = 'AddressValidationContext';

export const useAddressValidation = () => {
  const value = useContext(AddressValidationContext);
  invariant(
    value !== null,
    'useAddressValidation was used used outside of AddressValidationProvider',
  );
  return value;
};

/*
 * ADDRESS VALIDATION PROVIDER LOGIC
 *
 *    ┌─────────────────────────────────────────────────────────────────┐
 *    │                  User connects wallet                           │
 *    └─────────────────────┬───────────────────────────────────────────┘
 *                          │
 *                          ▼
 *                  ┌───────────────┐
 *                  │ Has address?  │
 *                  └───┬───────┬───┘
 *                      │ NO    │ YES
 *                      ▼       ▼
 *               ┌─────────┐   ┌────────────────────────────────────────┐
 *               │isValid: │   │     Start parallel queries:            │
 *               │  true   │   │                                        │
 *               └─────────┘   │ 1) apiValidationQuery                  │
 *                             │    enabled: addressApiValidationEnabled│
 *                             │                                        │
 *                             │ 2) fileValidationQuery                 │
 *                             │    enabled: !!address && !!file        │
 *                             │    checks: file.isBrocken → false      │
 *                             └─────────────┬──────────────────────────┘
 *                                           │
 *                                           ▼
 *                             ┌────────────────────────────────────────┐
 *                             │     addressApiValidationEnabled?       │
 *                             └─────────────┬──────────────────────────┘
 *                                           │
 *                          ┌────────────────┴────────────────┐
 *                          │ TRUE                            │ FALSE
 *                          ▼                                 ▼
 *     ┌─────────────────────────────────────┐     ┌──────────────────────┐
 *     │           API ENABLED               │     │     API DISABLED     │
 *     └─────────────────┬───────────────────┘     └──────────┬───────────┘
 *                       │                                    │
 *                       ▼                                    ▼
 *        ┌─────────────────────────────────┐        ┌──────────────────┐
 *        │      API responded?             │        │  File loaded?    │
 *        │   (apiValidationQuery.data)     │        └─────┬────────────┘
 *        └─────┬───────────────────────────┘              │
 *              │                                          ▼
 *    ┌─────────┴──────────┐              ┌─────────────────────────────┐
 *    │ YES                │ NO           │ return file.isValid         │
 *    ▼                    ▼              │ (or true if no file)        │
 * ┌─────────────────┐  ┌──────────────┐  └─────────────────────────────┘
 * │ return API      │  │ API Error?   │
 * │ result.isValid  │  └──────┬───────┘
 * └─────────────────┘         │
 *                   ┌─────────┴──────────┐
 *                   │ YES                │ NO (loading)
 *                   ▼                    ▼
 *            ┌─────────────────┐  ┌─────────────────┐
 *            │  File loaded?   │  │  File loaded?   │
 *            └─────┬───────────┘  └─────┬───────────┘
 *                  │                    │
 *                  ▼                    ▼
 *         ┌─────────────────┐   ┌──────────────────┐
 *         │ FALLBACK:       │   │ TEMPORARY:       │
 *         │ return file     │   │ return file      │
 *         │ .isValid        │   │ .isValid         │
 *         └─────────────────┘   └──────────────────┘
 *                  │                    │
 *                  └────────┬───────────┘
 *                           │
 *                           ▼
 *                  ┌─────────────────┐
 *                  │ isValid result  │
 *                  └─────────┬───────┘
 *                            │
 *                            ▼
 *                    ┌───────────────┐
 *                    │ isValid ===   │
 *                    │   false?      │
 *                    └───┬───────────┘
 *                        │
 *              ┌─────────┴─────────┐
 *              │ YES               │ NO
 *              ▼                   ▼
 *       ┌─────────────────┐ ┌─────────────────┐
 *       │ forceDisconnect │ │ Continue normal │
 *       │ wallet          │ │ operation       │
 *       └─────────────────┘ └─────────────────┘
 *              │                   │
 *              └─────────┬─────────┘
 *                        │
 *                        ▼
 *              ┌─────────────────────┐
 *              │ Provide isValid     │
 *              │ to child components │
 *              │ via React Context   │
 *              └─────────────────────┘
 *
 * PRIORITY ORDER:
 * 1. API result (when enabled & successful)
 * 2. File validation (as fallback or when API disabled)
 *    - If file.isBrocken = true → isValid = false
 *    - Otherwise → validateAddressLocally()
 * 3. Default: true (safe fallback)
 */

export const AddressValidationProvider = ({
  children,
  validationFile,
}: {
  children: ReactNode;
  validationFile?: AddressValidationFile;
}) => {
  const { forceDisconnect } = useForceDisconnect();
  const { address } = useAccount();
  const apiValidationQuery = useApiAddressValidation();
  const [isNotValidAddress, setIsNotValidAddress] = useState(false);

  // File validation query (works independently of API settings)
  const fileValidationQuery = useQuery({
    queryKey: [
      'address-validation-file',
      address,
      validationFile?.addresses?.length,
      validationFile?.isBrocken,
    ],
    ...STRATEGY_LAZY,
    enabled: !!address && !!validationFile, // Always enabled when address and file exist
    queryFn: async () => {
      if (!address || !validationFile) {
        return { isValid: true };
      }

      // If validation file is broken, consider all addresses invalid
      // if (validationFile.isBrocken) return { isValid: false }; // TODO: uncomment after testing

      return validateAddressLocally(address, validationFile);
    },
  });

  // Define validation result
  const isValid = useMemo(() => {
    // If no address, consider valid
    if (!address) return true;

    // Case 1: API is enabled
    if (config.addressApiValidationEnabled) {
      // API responded successfully - use API result
      if (apiValidationQuery.data) {
        return apiValidationQuery.data.isValid;
      }

      // API failed - fallback to file validation
      if (apiValidationQuery.error && fileValidationQuery.data) {
        return fileValidationQuery.data.isValid;
      }

      // API is loading, no error yet - use file as temporary validation if available
      if (!apiValidationQuery.error && fileValidationQuery.data) {
        return fileValidationQuery.data.isValid;
      }
    } else {
      // Case 2: API is disabled - use file validation when available
      if (fileValidationQuery.data) {
        return fileValidationQuery.data.isValid;
      }
    }

    // Default to valid if no validation data available
    return true;
  }, [
    address,
    apiValidationQuery.data,
    apiValidationQuery.error,
    fileValidationQuery.data,
  ]);

  // Disconnect wallet if address is invalid
  useEffect(() => {
    if (address && isValid === false) {
      forceDisconnect();
      setIsNotValidAddress(true);
    }
  }, [address, isValid, forceDisconnect]);

  return (
    <AddressValidationContext.Provider
      value={{
        validationResult: {
          isValid,
        },
        isNotValidAddress,
        setIsNotValidAddress,
      }}
    >
      {children}
    </AddressValidationContext.Provider>
  );
};
