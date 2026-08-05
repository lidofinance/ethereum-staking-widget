import { useMatch } from 'react-router';

import { EARN_PATH } from 'consts/urls';

/**
 * Replaces Next-era `pathname === '/earn/[vault]/[action]'` checks: the
 * router shim's `pathname` is the RESOLVED path and never carries the
 * bracket pattern, so those comparisons silently became always-false.
 */
export const useEarnVaultPageMatch = () =>
  useMatch(`${EARN_PATH}/:vault/:action`);
