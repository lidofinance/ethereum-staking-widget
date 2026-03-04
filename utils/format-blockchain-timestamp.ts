import { LOCALE } from 'config/groups/locale';
import { unixTimestampToMs } from './unix-timestamp-to-ms';

const DEFAULT_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
};

export const formatBlockchainTimestamp = (
  timestamp: bigint | number,
  {
    options = DEFAULT_DATE_FORMAT_OPTIONS,
    locale = LOCALE,
  }: { options?: Intl.DateTimeFormatOptions; locale?: string } = {},
): string =>
  new Date(unixTimestampToMs(timestamp)).toLocaleDateString(locale, options);
