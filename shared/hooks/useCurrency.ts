import { CurrencyContext, CurrencyValue } from 'providers';
import { useContext } from 'react';

export const useCurrency = (): CurrencyValue => {
  return useContext(CurrencyContext);
};
