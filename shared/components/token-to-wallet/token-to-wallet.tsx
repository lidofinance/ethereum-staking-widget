import { ToastError, ToastInfo, Tooltip } from '@lidofinance/lido-ui';
import { TokenToWalletStyle } from './styles';

import { Component } from 'types';
import { useWalletClient, useWatchAsset } from 'wagmi';
import { Address, getContract } from 'viem';

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
  const { data: walletClient } = useWalletClient();

  if (!walletClient || !address) return null;

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

      if (result) {
        ToastInfo('Tokens were successfully added to your wallet', {});
      } else {
        ToastInfo('User rejected the request');
      }
    } catch (error) {
      // Associating error code to UI messages
      if (error && typeof error === 'object' && 'code' in error) {
        if (
          error?.code === -32602 // Trust
        ) {
          ToastInfo('Tokens already added');
        } else if (
          error?.code === 4001 || // Metamask, coin98, okx
          error?.code === -32603 // Bitget
        ) {
          ToastInfo('User rejected the request');
        } else if (
          error?.code === -1 || // LL and Safe through WC
          error?.code === -32601 // LL in Discover
        ) {
          ToastError('The wallet does not support adding a token');
        } else {
          ToastError(
            'An error occurred while adding token to wallet\nThe wallet might not support adding a token',
          );
        }
      }

      console.warn('[TokenToWallet] error adding token to wallet', error);
    }
  };

  return (
    <Tooltip placement="bottomLeft" title="Add tokens to wallet">
      <TokenToWalletStyle tabIndex={-1} onClick={onClickHandler} {...rest} />
    </Tooltip>
  );
};
