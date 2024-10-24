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
  const { isDappActive } = useDappStatus();

  return <TokenSelectHookForm disabled={!isDappActive} options={OPTIONS} />;
};
