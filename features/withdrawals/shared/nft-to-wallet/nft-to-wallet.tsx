import { Tooltip } from '@lidofinance/lido-ui';
import { useAddNFT } from 'features/withdrawals/hooks';

import { TokenToWalletStyle } from './styles';

import { Component } from 'types';

export type TokenToWalletComponent = Component<'button'>;

export const NftToWallet: TokenToWalletComponent = (props) => {
  const { addNft } = useAddNFT();

  if (!addNft) return null;

  return (
    <Tooltip placement="bottomLeft" title="Add NFT to wallet">
      <TokenToWalletStyle tabIndex={-1} onClick={addNft} {...props} />
    </Tooltip>
  );
};
