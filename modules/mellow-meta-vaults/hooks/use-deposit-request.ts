import { Token } from 'consts/tokens';
import { CollectorContract, VaultContract } from '../types/contracts';
import { useDepositRequests } from './use-deposit-requests';

export const useDepositRequest = ({
  collector,
  vault,
  token,
}: {
  collector: CollectorContract;
  vault: VaultContract;
  token: Token;
}) => {
  const { requests } = useDepositRequests({
    collector,
    vault,
    depositTokens: [token],
  });
  return requests.find((request) => request.token === token);
};
