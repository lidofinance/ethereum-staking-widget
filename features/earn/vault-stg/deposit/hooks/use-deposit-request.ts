import { STG_DEPOSIT_TOKENS } from '../form-context/types';
import { useDepositRequests } from './use-stg-deposit-requests';

export const useDepositRequest = (token: STG_DEPOSIT_TOKENS) => {
  const depositRequests = useDepositRequests();
  return depositRequests.find((request) => request.token === token);
};
