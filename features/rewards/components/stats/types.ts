import { Backend } from 'features/rewards/types';
import { CurrencyType } from 'features/rewards/constants';

export type StatsProps = {
  address: string;
  data?: Backend;
  currency: CurrencyType;
  pending?: boolean;
};
