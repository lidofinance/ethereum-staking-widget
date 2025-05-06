import { FC, useMemo, ChangeEvent } from 'react';
import { isAddress } from 'viem';
import { Input, Loader, Identicon } from '@lidofinance/lido-ui';

import CopyAddressUrl from 'features/rewards/components/CopyAddressUrl';
import { isValidAnyAddress } from 'features/rewards/utils';
import { ReactComponent as ErrorTriangle } from 'assets/icons/error-triangle.svg';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_INPUT_EVENTS_TYPES } from 'consts/matomo';

import type { AddressInputProps } from './types';

export const AddressInput: FC<AddressInputProps> = (props) => {
  const {
    inputValue,
    isAddressResolving,
    handleInputChange,
    address,
    addressError: invalidENSAddress,
  } = props;

  const invalidEthereumAddress = useMemo(
    () => inputValue.length > 0 && !isValidAnyAddress(inputValue),
    [inputValue],
  );

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleInputChange(value);
    if (isAddress(value)) {
      trackMatomoEvent(
        MATOMO_INPUT_EVENTS_TYPES.ethRewardsEnterAddressManually,
      );
    }
  };

  return (
    <Input
      fullwidth
      value={inputValue}
      onChange={onChange}
      placeholder="Ethereum address"
      leftDecorator={
        isAddressResolving ? (
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
