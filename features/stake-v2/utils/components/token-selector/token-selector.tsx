import type { ReactNode } from 'react';

import type { TokenListItem } from 'modules/web3';

import { TokenDropdown } from './token-dropdown';
import { TokenSelectorPopover } from './token-selector-popover';
import type { TokenSelectorValue } from './types';

type TokenSelectorProps = {
  value: TokenSelectorValue;
  onChange: (value: TokenSelectorValue) => void;
  /** `tokens` of useTokenList */
  options: readonly TokenListItem[];
  /** `isLoading` of useTokenList: balances show as skeletons */
  isLoading?: boolean;
  /** caption above the list, e.g. "My tokens"; none when omitted */
  label?: ReactNode;
};

/**
 * Controlled token + chain picker: a chip that opens the token list,
 * or plain chip content when there is nothing to pick from.
 */
export const TokenSelector = ({
  value,
  onChange,
  options,
  isLoading = false,
  label,
}: TokenSelectorProps) => (
  <TokenDropdown
    value={value}
    isStatic={options.length === 1}
    popoverLabel="Select token"
  >
    {(close) => (
      <TokenSelectorPopover
        value={value}
        onSelect={(next) => {
          close();
          onChange(next);
        }}
        options={options}
        isLoading={isLoading}
        label={label}
      />
    )}
  </TokenDropdown>
);
