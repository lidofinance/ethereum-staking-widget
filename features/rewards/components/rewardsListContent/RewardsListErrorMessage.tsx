import { ErrorBlockBase } from '../errorBlocks/ErrorBlockBase';

import { extractErrorMessage } from 'utils';
import { FetcherError } from 'utils/fetcherError';

type Props = {
  error: unknown;
};

export const RewardsListErrorMessage: React.FC<Props> = ({ error }) => {
  const errorMessage = extractErrorMessage(error);

  if (error instanceof FetcherError && error.status === 503) {
    return (
      <ErrorBlockBase textProps={{ color: 'error' }} text={errorMessage} />
    );
  }

  return <ErrorBlockBase text={errorMessage} />;
};
