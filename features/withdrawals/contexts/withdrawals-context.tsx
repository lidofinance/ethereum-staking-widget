import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
} from 'react';
import invariant from 'tiny-invariant';

import { StatusProps } from 'features/withdrawals/shared/status';
import { useWithdrawalsBaseData } from 'features/withdrawals/hooks/contract/useWithdrawalsBaseData';

export type WithdrawalsContextValue = {
  isClaimTab: boolean;
  withdrawalsStatus: StatusProps['variant'];
  isWithdrawalsStatusLoading: boolean;
  isPaused?: boolean;
  isTurbo?: boolean;
  isBunker?: boolean;
  maxAmount?: bigint;
  minAmount?: bigint;
};
const WithdrawalsContext = createContext<WithdrawalsContextValue | null>(null);
WithdrawalsContext.displayName = 'WithdrawalsContext';

export const useWithdrawals = () => {
  const value = useContext(WithdrawalsContext);
  invariant(value, 'useWithdrawals was used outside WithdrawalContext');
  return value;
};

type WithdrawalsProviderProps = {
  mode: 'request' | 'claim';
};

export const WithdrawalsProvider: FC<
  PropsWithChildren<WithdrawalsProviderProps>
> = ({ children, mode }) => {
  const isClaimTab = mode === 'claim';

  const { data, initialLoading: isWithdrawalsStatusLoading } =
    useWithdrawalsBaseData();
  const { isBunker, isPaused, isTurbo, maxAmount, minAmount } = data ?? {};

  const withdrawalsStatus: StatusProps['variant'] = (() => {
    if (isPaused) return 'error';
    if (isBunker) return 'warning';
    if (isTurbo) return 'success';
    return 'error';
  })();

  const value = useMemo(
    () => ({
      isClaimTab,
      withdrawalsStatus,
      isWithdrawalsStatusLoading,
      isPaused,
      isTurbo,
      isBunker,
      maxAmount,
      minAmount,
    }),
    [
      isClaimTab,
      withdrawalsStatus,
      isWithdrawalsStatusLoading,
      isPaused,
      isTurbo,
      isBunker,
      maxAmount,
      minAmount,
    ],
  );

  return (
    <WithdrawalsContext.Provider value={value}>
      {children}
    </WithdrawalsContext.Provider>
  );
};
