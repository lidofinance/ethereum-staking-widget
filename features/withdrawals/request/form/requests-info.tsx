import { TOKENS } from '@lido-sdk/constants';
import { useFormState, useWatch } from 'react-hook-form';
import { FormatToken } from 'shared/formatters';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import {
  RequestFormInputType,
  useRequestFormData,
  useValidationResults,
} from '../request-form-context';
import { RequestsInfoStyled, RequestsInfoDescStyled } from './styles';
import { ValidationSplitRequest } from '../request-form-context/validators';

export const RequestsInfo = () => {
  const { errors } = useFormState<RequestFormInputType>();
  const token = useWatch<RequestFormInputType, 'token'>({ name: 'token' });
  const { requests } = useValidationResults();
  const { maxAmountPerRequestSteth, maxAmountPerRequestWSteth } =
    useRequestFormData();

  if (errors.amount?.type === ValidationSplitRequest.type)
    return (
      <RequestsInfoStyled>
        <RequestsInfoDescStyled>{errors.amount.message}</RequestsInfoDescStyled>
      </RequestsInfoStyled>
    );

  const requestCount = requests?.length ?? 0;
  const maxPerTx =
    token === TOKENS.STETH
      ? maxAmountPerRequestSteth
      : maxAmountPerRequestWSteth;

  if (requestCount <= 1 || !maxPerTx) return null;
  return (
    <RequestsInfoStyled>
      <RequestsInfoDescStyled>
        Your amount will be split into {requestCount} requests because{' '}
        <FormatToken amount={maxPerTx} symbol={getTokenDisplayName(token)} /> is
        the maximum amount per one request. Although it will be {requestCount}{' '}
        requests, you will pay one transaction fee.
      </RequestsInfoDescStyled>
    </RequestsInfoStyled>
  );
};
