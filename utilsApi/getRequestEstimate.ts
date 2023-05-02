import { iterateUrls } from '@lidofinance/rpc';
import { TOKENS } from '@lido-sdk/constants';

import { WithdrawalRequestNFTAbi__factory } from 'generated';
import { getWithdrawalRequestNFTAddress } from 'customSdk/contracts';

import { getStaticRpcBatchProvider } from './rpcProviders';
import { serverLogger } from './serverLogger';
import { rpcUrls } from './rpcUrls';

import {
  ESTIMATE_ACCOUNT,
  WITHDRAWAL_QUEUE_REQUEST_STETH_PERMIT_GAS_LIMIT_DEFAULT,
  WITHDRAWAL_QUEUE_REQUEST_WSTETH_PERMIT_GAS_LIMIT_DEFAULT,
} from 'config';
import { ESTIMATE_ACCOUNT_PERMITS } from 'config/estimatePermits';
import { CHAINS } from 'utils/chains';

type getRequestEstimateParams = {
  chainId: CHAINS;
  token: TOKENS.STETH | TOKENS.WSTETH;
  requestCount: number;
};

export const getRequestEstimate = async (
  options: getRequestEstimateParams,
): Promise<number> => {
  const urls = rpcUrls[options.chainId];
  const iterate = (url: string) =>
    getRequestEstimateWithFallbacks(url, options);
  return iterateUrls(urls, iterate, serverLogger.error);
};

const getRequestEstimateWithFallbacks = async (
  url: string,
  { chainId, requestCount, token }: getRequestEstimateParams,
): Promise<number> => {
  const staticProvider = getStaticRpcBatchProvider(chainId, url);
  // TODO resolve CHAINS duplication issue
  // we have conflicting CHAINS enums
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wqAddress = getWithdrawalRequestNFTAddress(chainId as any);
  if (!wqAddress)
    throw new Error(
      `No Withdrawal Queue Contract address for chain ${chainId}`,
    );
  const wqContract = WithdrawalRequestNFTAbi__factory.connect(
    wqAddress,
    staticProvider,
  );
  const permits = ESTIMATE_ACCOUNT_PERMITS[chainId];
  if (!permits) throw new Error(`No estimate permit for chain ${chainId}`);
  const permit =
    token === 'STETH' ? permits.steth_permit : permits.wsteth_permit;
  const method =
    token === 'STETH'
      ? wqContract.estimateGas.requestWithdrawalsWithPermit
      : wqContract.estimateGas.requestWithdrawalsWstETHWithPermit;

  // This helps estimateGas binary search impl to run correctly
  const helperGasLimit =
    (token === 'STETH'
      ? WITHDRAWAL_QUEUE_REQUEST_STETH_PERMIT_GAS_LIMIT_DEFAULT
      : WITHDRAWAL_QUEUE_REQUEST_WSTETH_PERMIT_GAS_LIMIT_DEFAULT) *
    requestCount *
    10;

  const estimate = await method(
    Array(requestCount).fill(100),
    ESTIMATE_ACCOUNT,
    permit,
    {
      from: ESTIMATE_ACCOUNT,
      gasLimit: helperGasLimit,
    },
  ).then((r) => r.toNumber());

  return estimate;
};
