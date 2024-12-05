import { fromUnixTime } from 'date-fns';
import { formatEther } from 'viem';

import type { Event } from 'features/rewards/types';
import type { CurrencyType } from 'features/rewards/constants';

export const genExportData = (currency: CurrencyType, data: Event[] | null) =>
  data
    ? data.map((item) => ({
        date: fromUnixTime(parseInt(item.blockTime)).toISOString(),
        type: item.type,
        direction: item.direction,
        change: formatEther(BigInt(item.change)),
        change_wei: item.change.toString(),
        [`change_${currency.code}`]: item.currencyChange?.toString(),
        apr: item.apr,
        balance: formatEther(BigInt(item.balance)),
        balance_wei: item.balance,
      }))
    : [];
