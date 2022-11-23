import { FC, createContext } from 'react';

export type CurrencyValue = {
  cookiesCurrency?: string;
};

export const CurrencyContext = createContext({} as CurrencyValue);

type Props = {
  cookiesCurrency?: string;
};

const CurrencyProvider: FC<Props> = ({ cookiesCurrency, children }) => (
  <CurrencyContext.Provider value={{ cookiesCurrency }}>
    {children}
  </CurrencyContext.Provider>
);

export default CurrencyProvider;
