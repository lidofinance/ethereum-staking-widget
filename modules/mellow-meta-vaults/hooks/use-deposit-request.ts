import { Contract } from '../types/contract';
import { useDepositRequests } from './use-deposit-requests';

export const useDepositRequest = <DepositToken extends string>({
  collector,
  vault,
  token,
}: {
  collector: Contract;
  vault: Contract;
  token: DepositToken;
}) => {
  const { requests } = useDepositRequests({
    collector,
    vault,
    depositTokens: [token],
  });
  return requests.find((request) => request.token === token);
};
