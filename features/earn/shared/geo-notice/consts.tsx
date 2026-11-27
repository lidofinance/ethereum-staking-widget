import { Link } from '@lidofinance/lido-ui';
import type { ReactNode } from 'react';

import type { GeoNoticeState } from 'utils/geo';

export const GEO_CHECKING_TEXT =
  'Checking availability in your region. This usually takes a moment.';

export const GEO_CHECKING_SLOW_TEXT =
  'Still checking. This is taking longer than usual.';

export const GEO_LIMITED_TEXT = (
  <>
    In accordance with the{' '}
    <Link href="https://mellow.finance/Runtime-Labs-Vault-Legal-Notice.pdf">
      Terms of Service
    </Link>
    , this vault is not available in your current region. Withdrawals remain
    available for funds deposited earlier.
  </>
);

export const GEO_LIMITED_CARD_TEXT =
  'This vault is not available in your region. Withdrawals remain ' +
  'available for funds deposited earlier.';

export const GEO_UNRESOLVED_TEXT =
  "We couldn't verify your region. Deposits are unavailable until we can " +
  'confirm it. Withdrawals remain available for funds deposited earlier.';

export const GEO_SLOW_CHECK_DELAY_MS = 5000;

export const GEO_NOTICE_TEXTS: Record<GeoNoticeState, ReactNode> = {
  checking: GEO_CHECKING_TEXT,
  'checking-slow': GEO_CHECKING_SLOW_TEXT,
  limited: GEO_LIMITED_TEXT,
  unresolved: GEO_UNRESOLVED_TEXT,
};
