import { fromUnixTime } from 'date-fns';

import { BigDecimal } from 'features/rewards/helpers';
import type { BigNumber } from 'features/rewards/helpers';
import type { Event } from 'features/rewards/types';
import type { CurrencyType } from 'features/rewards/constants';

export const ETHER = '1e18';

export const weiToEther = (wei: BigNumber | string) =>
  new BigDecimal(wei).div(ETHER);

export const genExportData = (currency: CurrencyType, data: Event[] | null) =>
  data
    ? data.map((item) => ({
        date: fromUnixTime(parseInt(item.blockTime)).toISOString(),
        type: item.type,
        direction: item.direction,
        change: weiToEther(item.change).toString(),
        change_wei: item.change.toString(),
        [`change_${currency.code}`]: item.currencyChange?.toString(),
        apr: item.apr,
        balance: weiToEther(item.balance).toString(),
        balance_wei: item.balance,
      }))
    : [];
