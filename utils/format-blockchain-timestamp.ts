import { LOCALE } from 'config/groups/locale';
import { unixTimestampToMs } from './unix-timestamp-to-ms';

const DEFAULT_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
};

export const formatBlockchainTimestamp = (
  timestamp: bigint | number,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_FORMAT_OPTIONS,
): string =>
  new Date(unixTimestampToMs(timestamp)).toLocaleDateString(LOCALE, options);
