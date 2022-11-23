import { Box, Select, Option } from '@lidofinance/lido-ui';
import styled from 'styled-components';
import { CURRENCIES, type CurrencyType } from 'features/rewards/constants';
import { STORAGE_CURRENCY_KEY } from 'config';
import Cookies from 'js-cookie';

// TODO: move to style file
const StyledSelect = styled(Select)`
  height: 32px;
  width: 70px;

  border-radius: 6px;

  & span {
    padding: unset;
  }

  & input {
    font-size: 12px;
    font-weight: 400;
  }

  & span:nth-of-type(2) {
    padding-left: unset;
  }
`;

const COOKIES_THEME_EXPIRES_DAYS = 365;

const setCookie = (value: string) =>
  Cookies.set(STORAGE_CURRENCY_KEY, value, {
    expires: COOKIES_THEME_EXPIRES_DAYS,
  });

type Props = { currency: CurrencyType; onChange: (val: string) => void };

// TODO: move to separate folders
const CurrencySelector = ({ currency, onChange }: Props) => (
  <Box>
    <StyledSelect
      arrow="small"
      onChange={(option: string | number) => {
        const optionString = option.toString();
        onChange(optionString);
        setCookie(optionString);
      }}
      value={currency.code}
      variant="small"
    >
      {CURRENCIES.map((cur) => (
        <Option key={cur.id} value={cur.id}>
          {cur.code}
        </Option>
      ))}
    </StyledSelect>
  </Box>
);

export default CurrencySelector;
