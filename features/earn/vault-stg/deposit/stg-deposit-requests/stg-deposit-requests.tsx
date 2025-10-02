import { useSTGAvailable } from '../../hooks/use-stg-available';
import { RequestsContainer } from '../../withdraw/stg-withdraw-request';
import {
  useDepositRequestData,
  useSTGDepositCancel,
  useSTGDepositClaim,
} from '../hooks';
import { STGDepositPendingRequests } from './stg-deposit-pending-requests';
import { STGDepositClaimableShares } from './stg-deposit-claimable-shares';

export const STGDepositRequests = () => {
  const { isSTGAvailable } = useSTGAvailable();
  const ethRequestData = useDepositRequestData('ETH');
  const wethRequestData = useDepositRequestData('wETH');
  const wstethRequestData = useDepositRequestData('wstETH');
  const { cancel, isCanceling } = useSTGDepositCancel();
  const { claim, isClaiming } = useSTGDepositClaim();

  const depositRequestDataList = [
    ethRequestData,
    wethRequestData,
    wstethRequestData,
  ];

  const totalClaimableShares =
    ethRequestData.claimableShares +
    wethRequestData.claimableShares +
    wstethRequestData.claimableShares;

  const hasAnyDepositRequests = depositRequestDataList.some(
    (data) => data.depositRequest,
  );

  if (!hasAnyDepositRequests || !isSTGAvailable) {
    return null;
  }

  return (
    <RequestsContainer>
      <STGDepositPendingRequests
        requestDataList={depositRequestDataList}
        cancel={cancel}
        isLoading={isCanceling || isClaiming}
      />
      <STGDepositClaimableShares
        claimableShares={totalClaimableShares}
        claim={claim}
        isLoading={isCanceling || isClaiming}
      />
    </RequestsContainer>
  );
};
