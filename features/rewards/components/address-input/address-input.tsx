import { FC } from 'react';
import { Input, Loader, Identicon } from '@lidofinance/lido-ui';
import CopyAddressUrl from 'features/rewards/components/CopyAddressUrl';
import { isValidAnyAddress } from 'features/rewards/utils';

import { AddressInputProps } from './types';

export const AddressInput: FC<AddressInputProps> = (props) => {
  const {
    inputValue,
    isAddressResolving,
    handleInputChange,
    address,
    addressError,
    loading,
  } = props;

  return (
    <Input
      fullwidth
      value={inputValue}
      onChange={(e) => handleInputChange(e.target.value)}
      placeholder="Ethereum address"
      leftDecorator={
        loading || isAddressResolving ? (
          <Loader size="small" />
        ) : address ? (
          <Identicon data-testid="addressIcon" address={address} />
        ) : null
      }
      rightDecorator={address ? <CopyAddressUrl address={inputValue} /> : null}
      spellCheck="false"
      error={
        (inputValue.length > 0 && !isValidAnyAddress(inputValue)) ||
        addressError
      }
    />
  );
};
