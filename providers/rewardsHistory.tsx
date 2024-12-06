import {
  FC,
  PropsWithChildren,
  createContext,
  memo,
  useMemo,
  useState,
  useEffect,
} from 'react';
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
import { getCurrencyCookie } from 'features/rewards/components/CurrencySelector';
import { useDappStatus } from 'modules/web3';

export type RewardsHistoryValue = {
  currencyObject: CurrencyType;
  data?: Backend;
  error?: unknown;
  isLoading: boolean;
  isAddressResolving: boolean;
  isFetching: boolean;
  limit: number;
  page: number;
  skip: number;
  address: string;
  addressError: string;
  inputValue: string;
  isIncludeTransfers: boolean;
  isUseArchiveExchangeRate: boolean;
  isLagging: boolean;
  setInputValue: (value: string) => void;
  setIsIncludeTransfers: (value: boolean) => void;
  setIsUseArchiveExchangeRate: (value: boolean) => void;
  setPage: (page: number) => void;
  setCurrency: (value: string) => void;
};

export const RewardsHistoryContext = createContext({} as RewardsHistoryValue);

const RewardsHistoryProvider: FC<PropsWithChildren> = (props) => {
  const { children } = props;

  const { isSupportedChain } = useDappStatus();

  const [currency, setCurrency] = useState(DEFAULT_CURRENCY.id);

  useEffect(() => {
    const currencyValue = getCurrencyCookie();
    if (currencyValue) setCurrency(currencyValue);
  }, []);

  const [isIncludeTransfers, setIsIncludeTransfers] = useState(false);
  const [isUseArchiveExchangeRate, setIsUseArchiveExchangeRate] =
    useState(true);
  const [page, setPage] = useState(0);

  const skip = page * PAGE_ITEMS;
  const limit = PAGE_ITEMS;

  const {
    address,
    addressError,
    inputValue,
    setInputValue,
    isAddressResolving,
  } = useGetCurrentAddress();

  const { data, error, isFetching, isLoading, isLagging } = useRewardsDataLoad({
    address,
    isIncludeTransfers,
    isUseArchiveExchangeRate,
    currency,
    skip,
    limit,
  });

  useEffect(() => {
    setPage(0);
  }, [isUseArchiveExchangeRate, isIncludeTransfers]);

  const currencyObject = getCurrency(currency);

  const isDataAvailable = data && isSupportedChain;

  const value = useMemo(
    (): RewardsHistoryValue => ({
      // we want user to not confuse which chain rewards are showing
      data: isDataAvailable ? data : undefined,
      error,
      isFetching,
      isLoading,
      currencyObject,
      skip,
      limit,
      page,
      setPage,
      isIncludeTransfers,
      setIsIncludeTransfers,
      setIsUseArchiveExchangeRate,
      isUseArchiveExchangeRate,
      setCurrency,
      isAddressResolving,
      address,
      addressError,
      inputValue,
      setInputValue,
      isLagging,
    }),
    [
      address,
      addressError,
      currencyObject,
      isDataAvailable,
      data,
      error,
      isLoading,
      inputValue,
      isAddressResolving,
      isLagging,
      isIncludeTransfers,
      isUseArchiveExchangeRate,
      limit,
      isFetching,
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

export default memo<FC<PropsWithChildren>>(RewardsHistoryProvider);
