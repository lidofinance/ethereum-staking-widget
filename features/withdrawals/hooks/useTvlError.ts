import { useMemo } from 'react';
import { useController } from 'react-hook-form';
import {
  TvlErrorPayload,
  ValidationTvlJoke,
} from '../request/request-form-context/validators';
import { RequestFormInputType } from 'features/withdrawals/request/request-form-context';

const getTvlError = (error?: unknown) =>
  error &&
  typeof error === 'object' &&
  'type' in error &&
  error.type == ValidationTvlJoke.type &&
  'payload' in error
    ? (error.payload as TvlErrorPayload)
    : { balanceDiffSteth: undefined, tvlDiff: undefined };

export const useTvlError = () => {
  const {
    fieldState: { error },
  } = useController<RequestFormInputType, 'amount'>({
    name: 'amount',
  });

  return useMemo(() => getTvlError(error), [error]);
};
