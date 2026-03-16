import type { STGDepositTokens } from '../form-context/types';
import { useDepositRequests } from './use-stg-deposit-requests';

export const useDepositRequest = (token: STGDepositTokens) => {
  const { requests } = useDepositRequests();
  return requests.find((request) => request.token === token);
};
