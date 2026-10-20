import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useDappStatus, useMainnetOnlyWagmi } from 'modules/web3';
import { isSyncRedeemReportUsable } from 'modules/mellow-meta-vaults/utils/sync-redeem-requirements';

import {
  getOracleContract,
  getSyncRedeemQueueContractWSTETH,
} from '../contracts';
import { ETH_VAULT_QUERY_SCOPE } from '../consts';

export const SYNC_REDEEM_REPORT_QUERY_KEY = 'sync-redeem-report';

type UseEthVaultSyncRedeemReportArgs = {
  enabled?: boolean;
};

/**
 * The oracle report the sync redeem queue prices a redemption with, and the
 * age the queue accepts. The queue reverts on a stale, suspicious or zero
 * report (ETHV-WD-ROUTE-05), so the withdraw hook withholds the instant route
 * while the report is unusable and the request goes to the async queue, which
 * has no such condition. Polled once a minute: the report moves with the
 * oracle's own cadence, not per request.
 */
export const useEthVaultSyncRedeemReport = ({
  enabled = true,
}: UseEthVaultSyncRedeemReportArgs = {}) => {
  const { chainId } = useDappStatus();
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  const { data, isLoading } = useQuery({
    queryKey: [ETH_VAULT_QUERY_SCOPE, SYNC_REDEEM_REPORT_QUERY_KEY, chainId],
    enabled: enabled && !!publicClientMainnet,
    ...STRATEGY_LAZY,
    refetchInterval: 60 * 1000,
    queryFn: async () => {
      invariant(publicClientMainnet, 'Public client is not defined');
      const syncQueue = getSyncRedeemQueueContractWSTETH(publicClientMainnet);
      const oracle = getOracleContract(publicClientMainnet);
      // the queue prices with its vault's oracle report for its own asset
      const [asset, [, maxAge]] = await Promise.all([
        syncQueue.read.asset(),
        syncQueue.read.syncRedeemParams(),
      ]);
      const report = await oracle.read.getReport([asset]);
      return { report, maxAge };
    },
  });

  // Judged against the clock of this render, so a report that aged past
  // maxAge since the last poll reads as stale without waiting for the next
  const isUsable = data
    ? isSyncRedeemReportUsable({
        report: data.report,
        maxAge: data.maxAge,
        nowSeconds: Math.floor(Date.now() / 1000),
      })
    : undefined;

  return { isUsable, isLoading };
};
