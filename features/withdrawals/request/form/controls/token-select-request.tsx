import {
  TOKENS,
  TokenOption,
  TokenSelectHookForm,
} from 'shared/hook-form/controls/token-select-hook-form';
import { useIsConnectedWalletAndSupportedChain } from 'shared/hooks/use-is-connected-wallet-and-supported-chain';

const OPTIONS: TokenOption[] = [
  { token: TOKENS.STETH },
  { token: TOKENS.WSTETH },
];

export const TokenSelectRequest = () => {
  const isActiveWallet = useIsConnectedWalletAndSupportedChain();

  return <TokenSelectHookForm disabled={!isActiveWallet} options={OPTIONS} />;
};
