import { ToastInfo, Tooltip } from '@lidofinance/lido-ui';
import { useTokenToWallet } from '@lido-sdk/react';
import { TokenToWalletStyle } from './styles';

import { Component } from 'types';

export type TokenToWalletComponent = Component<'button', { address?: string }>;

export const TokenToWallet: TokenToWalletComponent = (props) => {
  const { address, ...rest } = props;
  // TODO reacheck this for l2
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { addToken } = useTokenToWallet(address!);

  if (!addToken || !address) return null;

  const onClickHandler = async () => {
    const result = await addToken();
    if (!result) return;

    ToastInfo('Tokens were successfully added to your wallet', {});
  };

  return (
    <Tooltip placement="bottomLeft" title="Add tokens to wallet">
      <TokenToWalletStyle tabIndex={-1} onClick={onClickHandler} {...rest} />
    </Tooltip>
  );
};
