import {
  TOKENS,
  TokenOption,
  TokenSelectHookForm,
} from 'shared/hook-form/controls/token-select-hook-form';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

const OPTIONS: TokenOption[] = [
  { token: TOKENS.STETH },
  { token: TOKENS.WSTETH },
];

export const TokenSelectRequest = () => {
  const { isDappActive } = useDappStatus();

  return <TokenSelectHookForm disabled={!isDappActive} options={OPTIONS} />;
};
