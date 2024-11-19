import { fromUnixTime } from 'date-fns';

import type { Event } from 'features/rewards/types';
import type { CurrencyType } from 'features/rewards/constants';
import { weiToEth } from '../../../utils';

export const genExportData = (currency: CurrencyType, data: Event[] | null) =>
  data
    ? data.map((item) => ({
        date: fromUnixTime(parseInt(item.blockTime)).toISOString(),
        type: item.type,
        direction: item.direction,
        change: weiToEth(BigInt(item.change)).toString(),
        change_wei: item.change.toString(),
        [`change_${currency.code}`]: item.currencyChange?.toString(),
        apr: item.apr,
        balance: weiToEth(BigInt(item.balance)).toString(),
        balance_wei: item.balance,
      }))
    : [];
