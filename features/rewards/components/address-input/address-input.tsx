import { FC, useMemo } from 'react';
import { Input, Loader, Identicon } from '@lidofinance/lido-ui';
import CopyAddressUrl from 'features/rewards/components/CopyAddressUrl';
import { isValidAnyAddress } from 'features/rewards/utils';
import { ReactComponent as ErrorTriangle } from 'assets/icons/error-triangle.svg';

import { AddressInputProps } from './types';

export const AddressInput: FC<AddressInputProps> = (props) => {
  const {
    inputValue,
    isAddressResolving,
    handleInputChange,
    address,
    addressError: invalidENSAddress,
    loading,
  } = props;

  const invalidEthereumAddress = useMemo(
    () => inputValue.length > 0 && !isValidAnyAddress(inputValue),
    [inputValue],
  );

  return (
    <Input
      fullwidth
      value={inputValue}
      onChange={(e) => handleInputChange(e.target.value)}
      placeholder="Ethereum address"
      leftDecorator={
        loading || isAddressResolving ? (
          <Loader size="small" />
        ) : invalidEthereumAddress || invalidENSAddress ? (
          <ErrorTriangle />
        ) : address ? (
          <Identicon data-testid="addressIcon" address={address} />
        ) : null
      }
      rightDecorator={address ? <CopyAddressUrl address={inputValue} /> : null}
      spellCheck="false"
      error={
        invalidEthereumAddress
          ? 'Invalid ethereum address'
          : invalidENSAddress
            ? invalidENSAddress
            : null
      }
    />
  );
};
