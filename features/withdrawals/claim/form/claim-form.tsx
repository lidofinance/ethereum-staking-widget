import { useCallback, useRef, useState } from 'react';
import { useWeb3 } from '@reef-knot/web3-react';
import { BigNumber } from 'ethers';

import { FormatToken } from 'shared/formatters';
import { Connect } from 'shared/wallet';

import { Info } from './info';
import { BunkerInfo } from './bunker-info';
import { useClaim, useWithdrawalsStatus } from 'features/withdrawals/hooks';
import { useClaimTxPrice } from 'features/withdrawals/hooks/useWithdrawTxPrice';
import { useTransactionModal } from 'features/withdrawals/contexts/transaction-modal-context';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';

import { Button, DataTableRow } from '@lidofinance/lido-ui';
import { RequestsList } from '../requests-list/requests-list';
import { ClaimFormBody } from './styles';
import { ClaimFormFooterSticky } from './claim-form-footer-sticky';

export const ClaimForm = () => {
  const refRequests = useRef<HTMLDivElement>(null);

  const { active } = useWeb3();
  const { dispatchModalState } = useTransactionModal();
  const { ethToClaim, claimSelection } = useClaimData();
  const { isBunkerMode } = useWithdrawalsStatus();
  const { requests, withdrawalRequestsData } = useClaimData();
  const isLoading = withdrawalRequestsData.loading;
  const isEmpty = !withdrawalRequestsData.loading && requests.length === 0;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const txPriceInUsd = useClaimTxPrice();
  const claimMutation = useClaim();

  const claim = useCallback(() => {
    // fix (re)start point
    const startTx = async () => {
      setIsSubmitting(true);
      return claimMutation(claimSelection.sortedSelectedRequests).finally(
        () => {
          setIsSubmitting(false);
        },
      );
    };
    // send it to state
    dispatchModalState({ type: 'set_starTx_callback', callback: startTx });
    // start flow
    startTx();
    return;
  }, [
    dispatchModalState,
    claimMutation,
    claimSelection.sortedSelectedRequests,
  ]);

  const claimButtonAmount = ethToClaim?.lte(BigNumber.from(0)) ? null : (
    <FormatToken amount={ethToClaim} symbol="ETH" />
  );

  return (
    <>
      <ClaimFormBody>
        {isBunkerMode ? <BunkerInfo /> : <Info />}
        <div ref={refRequests}>
          <RequestsList
            isLoading={isLoading}
            isEmpty={isEmpty}
            requests={requests}
          />
        </div>
      </ClaimFormBody>
      <ClaimFormFooterSticky
        isEnabled={!isLoading && !isEmpty}
        refRequests={refRequests}
        positionDeps={[requests.length]}
      >
        {active ? (
          <Button
            fullwidth
            disabled={
              ethToClaim?.lte(BigNumber.from(0)) ||
              claimSelection.selectedCount == 0
            }
            loading={isSubmitting}
            onClick={claim}
          >
            Claim {claimButtonAmount}
          </Button>
        ) : (
          <Connect fullwidth />
        )}
        <DataTableRow title="Max transaction cost" loading={!txPriceInUsd}>
          ${txPriceInUsd?.toFixed(2)}
        </DataTableRow>
      </ClaimFormFooterSticky>
    </>
  );
};
