import { useContext } from 'react';
import {
  WithdrawalsContext,
  WithdrawalsValue,
} from '../providers/withdrawals-provider/provider';

export const useWithdrawals = (): WithdrawalsValue => {
  return useContext(WithdrawalsContext);
};
