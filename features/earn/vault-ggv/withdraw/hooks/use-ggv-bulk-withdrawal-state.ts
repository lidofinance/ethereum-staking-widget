/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import {
  erc20Abi,
  getAbiItem,
  toFunctionSelector,
  zeroAddress,
  type Address,
  type PublicClient,
} from 'viem';

import { getTokenAddress } from 'config/networks/token-address';
import { useDappStatus, useMainnetOnlyWagmi } from 'modules/web3';

import {
  GGV_TELLER_ABI,
  getGGVAccountantContract,
  getGGVAuthorityContract,
  getGGVTellerContract,
  getGGVVaultContract,
} from '../../contracts';
import type { GGVWithdrawStoppedReason } from '../types';

const BULK_WITHDRAW_SELECTOR = toFunctionSelector(
  getAbiItem({ abi: GGV_TELLER_ABI, name: 'bulkWithdraw' }),
);

export type GGVBulkWithdrawalStateData = {
  canWithdraw: boolean;
  reason: GGVWithdrawStoppedReason;
  // WETH per one share. Null when the accountant is paused.
  rate: bigint | null;
  shareDecimals: number;
  minimumShares: bigint;
  // In shares. Limited by the WETH balance of the vault.
  withdrawCapacity: bigint | null;
};

// Pure reader, kept apart from React Query so the reasons are easy to test
export const fetchGGVBulkWithdrawalState = async (
  publicClient: PublicClient,
  address: Address | undefined,
): Promise<GGVBulkWithdrawalStateData> => {
  const teller = getGGVTellerContract(publicClient);
  const accountant = getGGVAccountantContract(publicClient);
  const vault = getGGVVaultContract(publicClient);
  const authority = getGGVAuthorityContract(publicClient);
  const wethAddress = getTokenAddress(publicClient.chain!.id, 'WETH');
  invariant(wethAddress, 'WETH address is required');

  const [
    isTellerPaused,
    assetData,
    accountantState,
    canCall,
    shareDecimals,
    vaultWethBalance,
  ] = await Promise.all([
    teller.read.isPaused(),
    teller.read.assetData([wethAddress]),
    accountant.read.accountantState(),
    authority.read.canCall([
      address ?? zeroAddress,
      teller.address,
      BULK_WITHDRAW_SELECTOR,
    ]),
    vault.read.decimals(),
    publicClient.readContract({
      address: wethAddress,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [vault.address],
    }),
  ]);

  const [, allowWithdraws] = assetData;
  const isAccountantPaused = accountantState[8];

  // getRateInQuoteSafe reverts while the accountant is paused
  const rate = isAccountantPaused
    ? null
    : await accountant.read.getRateInQuoteSafe([wethAddress]);

  const withdrawCapacity =
    rate && rate > 0n
      ? (vaultWethBalance * 10n ** BigInt(shareDecimals)) / rate
      : null;

  let reason: GGVWithdrawStoppedReason = null;
  if (vaultWethBalance === 0n) reason = 'withdrawal-zero-capacity';
  if (!allowWithdraws) reason = 'withdrawal-stopped';
  // Teller reverts with UNAUTHORIZED until Veda opens bulkWithdraw
  if (!canCall) reason = 'bulk-withdraw-unavailable';
  if (isTellerPaused || isAccountantPaused) reason = 'paused';

  return {
    canWithdraw: reason === null,
    reason,
    rate,
    shareDecimals,
    minimumShares: 1n,
    withdrawCapacity,
  };
};

export const useGGVBulkWithdrawalState = (enabled: boolean) => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  const { address } = useDappStatus();

  return useQuery({
    queryKey: ['ggv', 'bulk-withdrawal-state', { address }],
    enabled,
    // Keep the form on screen when the wallet connects and the key changes
    placeholderData: keepPreviousData,
    queryFn: () => fetchGGVBulkWithdrawalState(publicClientMainnet, address),
  });
};
