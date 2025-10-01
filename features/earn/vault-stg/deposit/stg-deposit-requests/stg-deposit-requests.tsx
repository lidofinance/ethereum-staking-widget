import { useSTGAvailable } from '../../hooks/use-stg-available';
import { RequestsContainer } from '../../withdraw/stg-withdraw-request';
import { useDepositRequestData } from '../hooks';
import { STGDepositClaimableShares } from './stg-deposit-claimable-shares';
import { STGDepositPendingRequests } from './stg-deposit-pending-requests';

export const STGDepositRequests = () => {
  const { isSTGAvailable } = useSTGAvailable();
  const ethRequestData = useDepositRequestData('ETH');
  const wethRequestData = useDepositRequestData('wETH');
  const wstethRequestData = useDepositRequestData('wstETH');

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
      <STGDepositPendingRequests requestDataList={depositRequestDataList} />
      <STGDepositClaimableShares claimableShares={totalClaimableShares} />
    </RequestsContainer>
  );
};
