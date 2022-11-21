import { Event } from '.';

export type Backend = {
  events: Event[];
  totals: {
    ethRewards: number;
    currencyRewards: number;
  };
  averageApr: string;
  ethToStEthRatio: number;
  stETHCurrencyPrice: {
    [key: string]: number;
  };
  totalItems: number;
};
