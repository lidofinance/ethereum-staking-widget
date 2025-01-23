import { usePublicClient, useWalletClient, useWatchAsset } from 'wagmi';
import { type Address, type PublicClient, getContract } from 'viem';

import { ToastError, ToastInfo, Tooltip } from '@lidofinance/lido-ui';
import { useIsLedgerLive } from 'shared/hooks/useIsLedgerLive';
import { TokenToWalletStyle } from './styles';

import type { Component } from 'types';

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
  const { watchAssetAsync } = useWatchAsset({ mutation: { retry: false } });
  const isLegerLive = useIsLedgerLive();
  const client = usePublicClient();
  const { data: walletClient } = useWalletClient();

  if (isLegerLive || !walletClient || !address) return null;

  const onClickHandler = async () => {
    try {
      const tokenContract = getContract({
        abi: ERC20_METADATA_ABI,
        address: address as Address,
        client: client as PublicClient,
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
        ToastInfo(`${symbol} token was successfully added to your wallet`);
      } else {
        ToastInfo(
          `Request to watch ${symbol} token was rejected by your wallet`,
        );
      }
    } catch (error) {
      // Associating error code to UI messages
      if (error && typeof error === 'object' && 'code' in error) {
        if (
          error?.code === -32602 // Trust
        ) {
          ToastInfo('Token is already added');
        } else if (
          error?.code === 4001 || // Metamask, coin98, okx
          error?.code === -32603 // Bitget
        ) {
          ToastInfo(`Request to watch token was rejected by your wallet`);
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
