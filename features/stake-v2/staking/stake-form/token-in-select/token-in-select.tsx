import { useController } from 'react-hook-form';

import { useDappStatus, useTokenList } from 'modules/web3';

import { TokenSelector } from '../../../utils';
import { useStakeFormContext } from '../stake-form-context';

// TODO: move into a reusable token control
export const TokenInSelect = () => {
  const { isWalletConnected, chainId, requestChangeChain } = useDappStatus();
  const { tokens, isLoading } = useTokenList({ tokenList: 'stakable' });

  const { control } = useStakeFormContext();
  const { field } = useController({ control, name: 'tokenIn' });

  return (
    <TokenSelector
      value={field.value}
      onChange={(next) => {
        // a user pick on another chain asks for that chain; the form value
        // does not wait for it: until the wallet follows, the chain
        // mismatch keeps the submit button on "Switch Network"
        if (next.chainId !== chainId) void requestChangeChain(next.chainId);
        field.onChange(next);
      }}
      options={tokens}
      isLoading={isLoading}
      label={isWalletConnected ? 'My tokens' : 'Available tokens'}
    />
  );
};
