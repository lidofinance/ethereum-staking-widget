import { ErrorBlockLimits } from '../errorBlocks/ErrorBlockLimits';
import { ErrorBlockNoSteth } from '../errorBlocks/ErrorBlockNoSteth';
import { ErrorBlockNetwork } from '../errorBlocks/ErrorBlockNetwork';
import { ErrorBlockServer } from '../errorBlocks/ErrorBlockServer';

import { extractErrorMessage } from 'utils';
import { FetcherError } from 'utils/fetcherError';

type Props = {
  error: unknown;
};

export const RewardsListErrorMessage: React.FC<Props> = ({ error }) => {
  const errorMessage = extractErrorMessage(error);
  switch (errorMessage) {
    case 'Subgraph limits are hit.':
      return <ErrorBlockLimits />;
    case 'Address never had stETH.':
      return <ErrorBlockNoSteth />;
    case 'Subgraph incremental fetching failed.':
    case 'Subgraph indexing error.':
    case 'Subgraph error.':
      return <ErrorBlockServer />;
    default:
      if (error instanceof FetcherError && error.status >= 500) {
        return <ErrorBlockServer />;
      } else {
        return <ErrorBlockNetwork />;
      }
  }
};
