import { FC, createContext, memo, useMemo, useState, useEffect } from 'react';
import { Backend } from 'features/rewards/types';
import {
  DEFAULT_CURRENCY,
  getCurrency,
  PAGE_ITEMS,
} from 'features/rewards/constants';
import { CurrencyType } from 'features/rewards/constants';
import {
  useRewardsDataLoad,
  useGetCurrentAddress,
} from 'features/rewards/hooks';

export type RewardsHistoryValue = {
  currencyObject: CurrencyType;
  data?: Backend;
  error?: unknown;
  initialLoading: boolean;
  isAddressResolving: boolean;
  loading: boolean;
  limit: number;
  page: number;
  skip: number;
  address: string;
  inputValue: string;
  isOnlyRewards: boolean;
  isUseArchiveExchangeRate: boolean;
  isLagging: boolean;
  setInputValue: (value: string) => void;
  setIsOnlyRewards: (value: boolean) => void;
  setIsUseArchiveExchangeRate: (value: boolean) => void;
  setPage: (page: number) => void;
  setCurrency: (value: string) => void;
};

export const RewardsHistoryContext = createContext({} as RewardsHistoryValue);

type Props = {
  cookiesCurrency?: string;
};

const RewardsHistoryProvider: FC<Props> = (props) => {
  const { children, cookiesCurrency } = props;

  const [currency, setCurrency] = useState(
    cookiesCurrency ?? DEFAULT_CURRENCY.id,
  );
  const [isOnlyRewards, setIsOnlyRewards] = useState(false);
  const [isUseArchiveExchangeRate, setIsUseArchiveExchangeRate] =
    useState(true);
  const [page, setPage] = useState(0);

  const skip = page * PAGE_ITEMS;
  const limit = PAGE_ITEMS;

  const { address, inputValue, setInputValue, isAddressResolving } =
    useGetCurrentAddress();

  const { data, error, loading, initialLoading, isLagging } =
    useRewardsDataLoad({
      address,
      isOnlyRewards,
      isUseArchiveExchangeRate,
      currency,
      skip,
      limit,
    });

  useEffect(() => {
    setPage(0);
  }, [isUseArchiveExchangeRate, isOnlyRewards]);

  const currencyObject = getCurrency(currency);

  const value = useMemo(
    () => ({
      data,
      error,
      loading,
      initialLoading,
      currencyObject,
      skip,
      limit,
      page,
      setPage,
      isOnlyRewards,
      setIsOnlyRewards,
      setIsUseArchiveExchangeRate,
      isUseArchiveExchangeRate,
      setCurrency,
      isAddressResolving,
      address,
      inputValue,
      setInputValue,
      isLagging,
    }),
    [
      address,
      currencyObject,
      data,
      error,
      initialLoading,
      inputValue,
      isAddressResolving,
      isLagging,
      isOnlyRewards,
      isUseArchiveExchangeRate,
      limit,
      loading,
      page,
      setInputValue,
      skip,
    ],
  );

  return (
    <RewardsHistoryContext.Provider value={value}>
      {children}
    </RewardsHistoryContext.Provider>
  );
};

export default memo<FC<Props>>(RewardsHistoryProvider);
