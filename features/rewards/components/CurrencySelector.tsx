import Cookies from 'js-cookie';
import styled from 'styled-components';

import { Box, Select, Option } from '@lidofinance/lido-ui';

import { CURRENCIES, type CurrencyType } from 'features/rewards/constants';
import { STORAGE_CURRENCY_KEY } from 'config';

const StyledSelect = styled(Select)`
  height: 32px;
  width: 72px;

  border-radius: 6px;

  & > span {
    border-radius: ${({ theme }) => theme.borderRadiusesMap.sm}px;
  }

  & input {
    display: block;
    font-size: 12px;
    font-weight: 400;
    vertical-align: middle;
    line-height: 1em;
  }

  & span span {
    padding-left: 0;
  }
`;

const OptionStyled = styled(Option)`
  span {
    font-weight: 400;
  }
`;

const COOKIES_THEME_EXPIRES_DAYS = 365;

export const setCurrencyCookie = (value: string) =>
  Cookies.set(STORAGE_CURRENCY_KEY, value, {
    expires: COOKIES_THEME_EXPIRES_DAYS,
  });

export const getCurrencyCookie = () => Cookies.get(STORAGE_CURRENCY_KEY);

type CurrencySelectorProps = {
  currency: CurrencyType;
  onChange: (val: string) => void;
};

const CurrencySelector = ({ currency, onChange }: CurrencySelectorProps) => (
  <Box>
    <StyledSelect
      arrow="small"
      data-testid="currencyPicker"
      onChange={(option: string | number) => {
        const optionString = option.toString();
        onChange(optionString);
        setCurrencyCookie(optionString);
      }}
      value={currency.code}
      variant="small"
    >
      {CURRENCIES.map((cur) => (
        <OptionStyled key={cur.id} value={cur.id}>
          {cur.code}
        </OptionStyled>
      ))}
    </StyledSelect>
  </Box>
);

export default CurrencySelector;
