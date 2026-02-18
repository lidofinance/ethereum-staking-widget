import { CollectorContract, VaultContract } from '../types/contracts';
import { useDepositRequests } from './use-deposit-requests';

export const useDepositRequest = <DepositToken extends string>({
  collector,
  vault,
  token,
}: {
  collector: CollectorContract;
  vault: VaultContract;
  token: DepositToken;
}) => {
  const { requests } = useDepositRequests({
    collector,
    vault,
    depositTokens: [token],
  });
  return requests.find((request) => request.token === token);
};
