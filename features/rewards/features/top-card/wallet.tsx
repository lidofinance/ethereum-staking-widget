import { FC } from 'react';
import styled from 'styled-components';
import { ThemeProvider, themeDark } from '@lidofinance/lido-ui';

import { InputDescription } from 'features/rewards/components/inputDescription';
import { AddressInput } from 'features/rewards/components/addressInput';
import { InputWrapper } from 'features/rewards/components/inputWrapper';
import { useRewardsHistory } from 'features/rewards/hooks';

import { WalletCardStyle } from 'shared/wallet/card/styles';

const INPUT_DESC_TEXT =
  'Current balance may differ from last balance in the table due to rounding.';

const WalletStyle = styled(WalletCardStyle)`
  background: linear-gradient(
    52.01deg,
    #37394a 0%,
    #363749 0.01%,
    #40504f 100%
  );
  padding: 0 0 24px 0;
`;

export const Wallet: FC = () => {
  const { address, isAddressResolving, inputValue, setInputValue } =
    useRewardsHistory();

  return (
    <WalletStyle>
      <InputWrapper data-testid="inputSection" color="accent">
        <ThemeProvider theme={themeDark}>
          <AddressInput
            address={address}
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
