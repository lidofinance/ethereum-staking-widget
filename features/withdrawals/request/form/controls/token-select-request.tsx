import {
  TOKENS,
  TokenOption,
  TokenSelectHookForm,
} from 'shared/hook-form/controls/token-select-hook-form/token-select-hook-form';
import { useDappStatus } from 'modules/web3';

const OPTIONS: TokenOption[] = [
  { token: TOKENS.STETH },
  { token: TOKENS.WSTETH },
];

export const TokenSelectRequest = () => {
  const { isWalletConnected, isDappActive, isDappActiveOnL2 } = useDappStatus();

  return (
    <TokenSelectHookForm
      disabled={(isWalletConnected && !isDappActive) || isDappActiveOnL2}
      options={OPTIONS}
    />
  );
};
