import { CurrencyType } from 'features/rewards/constants';

export type RightOptionsProps = {
  address: string;
  archiveRate: boolean;
  onlyRewards: boolean;
  currency: CurrencyType;
  setCurrency: (val: string) => void;
};

export type LeftOptionsProps = {
  useArchiveExchangeRate: boolean;
  onlyRewards: boolean;
  setUseArchiveExchangeRate: (val: boolean) => void;
  setOnlyRewards: (val: boolean) => void;
};
