import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';

import { useQuery } from '@tanstack/react-query';
import { config } from 'config';
import { z } from 'zod';
import invariant from 'tiny-invariant';
import {
  AddressValidationFile,
  validateAddressLocally,
} from 'utils/address-validation';
import { useApiAddressValidation } from 'shared/hooks/use-api-address-validation';
import { standardFetcher } from 'utils/standardFetcher';
import { Address } from 'viem';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';

const StaticValidationFileSchema = z.object({
  addresses: z.array(z.string()),
  isBroken: z.boolean().optional().default(false),
});

type AddressValidationContextType = {
  isValidAddress: boolean;
  setIsValidAddress: (show: boolean) => void;
  validateAddress: (address?: Address) => Promise<boolean>;
};

const AddressValidationContext =
  createContext<AddressValidationContextType | null>(null);
AddressValidationContext.displayName = 'AddressValidationContext';

export const useAddressValidation = () => {
  const value = useContext(AddressValidationContext);
  invariant(
    value,
    'useAddressValidation was used used outside of AddressValidationProvider',
  );
  return value;
};

/*
 * ADDRESS VALIDATION PROVIDER LOGIC
 *
 * APPROACH: Manual function calls (not automatic useQuery)
 * - validateAddress(address) is called manually on user action
 *   (e.g. submit button click before form submission)
 * - The heavy lifting (external service + file fallback) lives SERVER-SIDE
 *   in /api/validation; the SPA keeps only a last-resort local check for
 *   the case when the api pod itself is unreachable.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │        User action triggers validateAddress(address)                │
 * └─────────────────────┬───────────────────────────────────────────────┘
 *                       │
 *                       ▼
 *           ┌───────────────────────────┐
 *           │ !address || ipfsMode?     │
 *           └───┬───────────────────┬───┘
 *               │ YES               │ NO
 *               ▼                   ▼
 *        ┌─────────────┐   ┌───────────────────────────────┐
 *        │ set=true    │   │ validation configured?        │
 *        │ return true │   │ (addressApiValidationEnabled  │
 *        └─────────────┘   │  || useValidationFile)        │
 *                          └──────┬────────────────────┬───┘
 *                                 │ YES                │ NO
 *                                 ▼                    ▼
 *              ┌─────────────────────────┐      ┌──────────────┐
 *              │ GET /api/validation     │      │ set=true     │
 *              │ (api pod)               │      │ return true  │
 *              └───────────┬─────────────┘      └──────────────┘
 *                          │
 *        ── server-side routing (routes/validation.ts) ──────────────
 *        │ 1. external service (VALIDATION_SERVICE_BASE_PATH)       │
 *        │    │ upstream failed?                                    │
 *        │    ▼                                                     │
 *        │ 2. blocklist file (VALIDATION_FILE_PATH configmap):      │
 *        │    broken file → {isValid:false} (fail-closed)           │
 *        │    healthy     → local list check                        │
 *        │    X-Validation-Source: upstream | file                  │
 *        │ 3. no file → 502; neither configured → 404               │
 *        ─────────────────────────────────────────────────────────────
 *                          │
 *              ┌───────────┴─────────────┐
 *              │ 2xx {isValid}?          │
 *              └───┬─────────────────┬───┘
 *                  │ YES             │ NO (api pod unreachable/5xx —
 *                  ▼                 ▼     e.g. DDoS on api; web pod +
 *        ┌──────────────┐  ┌─────────────────────┐  wallet-RPC transports
 *        │ set=API      │  │ staticBlocklist     │  keep working, so txs
 *        │ .isValid     │  │ prefetched at boot? │  still flow)
 *        │ return it    │  └───┬─────────────┬───┘
 *        └──────────────┘      │ YES         │ NO
 *                              ▼             ▼
 *                   ┌───────────────────┐  ┌─────────────┐
 *                   │ validateAddress   │  │ set=true    │
 *                   │ Locally(address,  │  │ return true │
 *                   │ staticBlocklist)  │  │ (fail-open) │
 *                   └───────────────────┘  └─────────────┘
 *
 * ALL POSSIBLE OUTCOMES:
 * 1. No address / ipfsMode            → true
 * 2. Validation not configured        → true (DEFAULT)
 * 3. /api/validation answered         → its isValid (upstream OR api-pod file)
 * 4. api pod down + static blocklist  → local check vs /runtime/validation.json
 * 5. api pod down + no blocklist      → true (fail-open, best-effort by nature)
 *
 * BLOCKLIST DELIVERY (one configmap, sha256-hashed at render time —
 * plain addresses never ship to pods or browsers):
 * - api pod: mounted file, used server-side inside /api/validation
 * - web pod: same configmap served by nginx as /runtime/validation.json,
 *   prefetched here once per session (staleTime: Infinity) so it is
 *   already cached when the api goes down mid-session
 * - dev: scripts/write-validation-file.mjs hashes VALIDATION_FILE_PATH into
 *   public/runtime/validation.json (same URL as k8s)
 *
 * CACHING (via react-query):
 * - /api/validation verdict: cached per address for 1 minute (the hook)
 * - static blocklist: once per session
 */
export const AddressValidationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const validateAddressAPI = useApiAddressValidation();
  // Tracks UI state, can be reset
  const [isValidAddress, setIsValidAddress] = useState(true);

  // Static blocklist from the web pod (nginx), NOT from the api pod — it
  // must stay reachable when the api is down. Prefetched once per session.
  const { data: staticBlocklist } = useQuery<AddressValidationFile>({
    queryKey: ['validation-static-file'],
    enabled: !config.ipfsMode && config.useValidationFile,
    ...STRATEGY_CONSTANT,
    retry: 1,
    queryFn: async () => {
      const data = await standardFetcher('/runtime/validation.json', {
        headers: { Accept: 'application/json' },
      });
      const parsed = StaticValidationFileSchema.parse(data);
      return {
        addresses: new Set(parsed.addresses.map((addr) => addr.toLowerCase())),
        isBroken: parsed.isBroken,
      };
    },
  });

  const validateAddress = useCallback(
    async (addressToValidate?: Address) => {
      // If no address, consider valid
      if (!addressToValidate || config.ipfsMode) {
        setIsValidAddress(true);

        return true;
      }

      const apiResult = await validateAddressAPI(addressToValidate);

      // api pod answered (from upstream or its own file fallback)
      if (apiResult !== null && apiResult.isValid !== undefined) {
        setIsValidAddress(apiResult.isValid);

        return apiResult.isValid;
      }

      // api pod unreachable → static blocklist from the web pod
      const isValid = staticBlocklist
        ? validateAddressLocally(addressToValidate, staticBlocklist).isValid
        : true;
      setIsValidAddress(isValid);

      return isValid;
    },
    [validateAddressAPI, staticBlocklist],
  );

  return (
    <AddressValidationContext.Provider
      value={{
        isValidAddress,
        setIsValidAddress,
        validateAddress,
      }}
    >
      {children}
    </AddressValidationContext.Provider>
  );
};
