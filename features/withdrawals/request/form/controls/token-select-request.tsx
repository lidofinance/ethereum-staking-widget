import {
  TOKENS,
  TokenOption,
  TokenSelectHookForm,
} from 'shared/hook-form/controls/token-select-hook-form/token-select-hook-form';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

const OPTIONS: TokenOption[] = [
  { token: TOKENS.STETH },
  { token: TOKENS.WSTETH },
];

export const TokenSelectRequest = () => {
  const { isWalletConnected, isDappActive, isAccountActiveOnL2 } =
    useDappStatus();

  return (
    <TokenSelectHookForm
      disabled={(isWalletConnected && !isDappActive) || isAccountActiveOnL2}
      options={OPTIONS}
    />
  );
};
