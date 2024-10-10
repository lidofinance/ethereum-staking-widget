import { ToastInfo, Tooltip } from '@lidofinance/lido-ui';
import { TokenToWalletStyle } from './styles';

import { Component } from 'types';
import { useWalletClient, useWatchAsset } from 'wagmi';
import { Address, getContract } from 'viem';
import { useConnectorInfo } from 'reef-knot/core-react';

export type TokenToWalletComponent = Component<'button', { address?: string }>;

const ERC20_METADATA_ABI = [
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const TokenToWallet: TokenToWalletComponent = ({ address, ...rest }) => {
  const { watchAssetAsync } = useWatchAsset();
  const { isInjected } = useConnectorInfo();
  const { data: walletClient } = useWalletClient();

  if (!walletClient || !address || !isInjected) return null;

  const onClickHandler = async () => {
    if (!address) return;

    try {
      const tokenContract = getContract({
        abi: ERC20_METADATA_ABI,
        address: address as Address,
        client: walletClient,
      });

      const [decimals, symbol] = await Promise.all([
        tokenContract.read.decimals(),
        tokenContract.read.symbol(),
      ]);

      const result = await watchAssetAsync({
        type: 'ERC20',
        options: { address, decimals, symbol },
      });
      if (!result) return;

      ToastInfo('Tokens were successfully added to your wallet', {});
    } catch (error) {
      console.warn('[TokenToWallet] error adding token to wallet', error);
    }
  };

  return (
    <Tooltip placement="bottomLeft" title="Add tokens to wallet">
      <TokenToWalletStyle tabIndex={-1} onClick={onClickHandler} {...rest} />
    </Tooltip>
  );
};
