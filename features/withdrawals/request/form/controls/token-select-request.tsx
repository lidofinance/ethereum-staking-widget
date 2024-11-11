import {
  TokenOption,
  TokenSelectHookForm,
} from 'shared/hook-form/controls/token-select-hook-form/token-select-hook-form';
import { useDappStatus } from 'modules/web3';
import { TOKENS_TO_WRAP } from '../../../../wsteth/shared/types';

const OPTIONS: TokenOption[] = [
  { token: TOKENS_TO_WRAP.stETH },
  { token: TOKENS_TO_WRAP.wstETH },
];

export const TokenSelectRequest = () => {
  const { isWalletConnected, isDappActive } = useDappStatus();

  return (
    <TokenSelectHookForm
      disabled={isWalletConnected && !isDappActive}
      options={OPTIONS}
    />
  );
};
