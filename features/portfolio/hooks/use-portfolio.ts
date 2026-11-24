import { useMemo } from 'react';

import { useDappStatus } from 'modules/web3';

import { getPortfolioSummary } from '../utils';
import { useLidoPositions } from './use-lido-positions';
import { useOtherHoldings } from './use-other-holdings';
import { usePortfolioAccess } from './use-portfolio-access';

export const usePortfolio = () => {
  const { address: walletAddress } = useDappStatus();
  const { isAllowed, isPending: isAccessPending } = usePortfolioAccess();
  // no address, no request: nothing is asked where the page is not offered
  const address = isAllowed ? walletAddress : undefined;
  const lido = useLidoPositions(address);
  const other = useOtherHoldings(address);

  const summary = useMemo(
    () => getPortfolioSummary(lido.rows, other.rows),
    [lido.rows, other.rows],
  );

  return { address, isAccessPending, lido, other, summary };
};
