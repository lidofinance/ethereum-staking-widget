import { STG_DEPOSIT_TOKENS } from '../form-context/types';
import { useDepositRequests } from './use-stg-deposit-requests';

export const useDepositRequest = (token: STG_DEPOSIT_TOKENS) => {
  const { requests } = useDepositRequests();
  return requests.find((request) => request.token === token);
};
