import { useCallback, useState } from 'react';
import { Block, Button } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';
import { BigNumber } from 'ethers';

import { FormatToken } from 'shared/formatters';
import { Connect } from 'shared/wallet';
import {
  useClaimTxModal,
  useClaim,
  useClaimData,
  useWithdrawalsStatus,
} from 'features/withdrawals/hooks';

import { RequestsBlock } from '../requests-block';
import { Info } from './info';
import { BunkerInfo } from './bunker-info';

export const ClaimForm = () => {
  const { active } = useWeb3();
  const { claimSelection, ethToClaim, selectedRequests } = useClaimData();
  const { buttonRef } = useClaimTxModal();
  const { isBunkerMode } = useWithdrawalsStatus();

  const [isLoading, setIsLoading] = useState(false);

  const claimMutation = useClaim();

  const claim = useCallback(() => {
    setIsLoading(true);
    return claimMutation(selectedRequests).finally(() => {
      setIsLoading(false);
    });
  }, [selectedRequests, claimMutation]);

  const claimButtonAmount = ethToClaim?.lte(BigNumber.from(0)) ? null : (
    <FormatToken amount={ethToClaim} symbol="ETH" />
  );

  return (
    <Block>
      {isBunkerMode ? <BunkerInfo /> : <Info />}
      <RequestsBlock />
      {active ? (
        <Button
          fullwidth
          disabled={
            ethToClaim?.lte(BigNumber.from(0)) ||
            claimSelection.getSelected().length === 0
          }
          loading={isLoading}
          onClick={claim}
          ref={buttonRef}
        >
          Claim {claimButtonAmount}
        </Button>
      ) : (
        <Connect fullwidth />
      )}
    </Block>
  );
};
