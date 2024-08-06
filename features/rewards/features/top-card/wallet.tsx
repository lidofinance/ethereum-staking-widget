import { FC } from 'react';
import { ThemeProvider, themeDark } from '@lidofinance/lido-ui';

import { InputDescription } from 'features/rewards/components/inputDescription';
import { AddressInput } from 'features/rewards/components/addressInput';
import { InputWrapper } from 'features/rewards/components/inputWrapper';
import { useRewardsHistory } from 'features/rewards/hooks';

import { WalletStyle } from './styles';

const INPUT_DESC_TEXT =
  'Current balance may differ from last balance in the table due to rounding.';

export const Wallet: FC = () => {
  const {
    address,
    addressError,
    isAddressResolving,
    inputValue,
    setInputValue,
  } = useRewardsHistory();

  return (
    <WalletStyle>
      <InputWrapper data-testid="inputSection" color="accent">
        <ThemeProvider theme={themeDark}>
          <AddressInput
            address={address}
            addressError={addressError}
            inputValue={inputValue}
            handleInputChange={setInputValue}
            isAddressResolving={isAddressResolving}
          />
          <InputDescription>{INPUT_DESC_TEXT}</InputDescription>
        </ThemeProvider>
      </InputWrapper>
    </WalletStyle>
  );
};
