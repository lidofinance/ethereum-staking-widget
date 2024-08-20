import { FC } from 'react';
import { ThemeProvider, themeDark } from '@lidofinance/lido-ui';

import { useRewardsHistory } from 'features/rewards/hooks';
import { AddressInput } from 'features/rewards/components/address-input';

import { WalletContentStyle, WalletStyle } from './styles';

export const Wallet: FC = () => {
  const {
    address,
    addressError,
    isAddressResolving,
    inputValue,
    setInputValue,
    loading,
  } = useRewardsHistory();

  return (
    <WalletStyle>
      <ThemeProvider theme={themeDark}>
        <WalletContentStyle>
          <AddressInput
            address={address}
            addressError={addressError}
            inputValue={inputValue}
            handleInputChange={setInputValue}
            isAddressResolving={isAddressResolving}
            loading={loading}
          />
        </WalletContentStyle>
      </ThemeProvider>
    </WalletStyle>
  );
};
