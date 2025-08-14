import { useStETHByWstETH } from 'modules/web3';
import { FormatPrice, FormatToken } from 'shared/formatters';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { useEthUsd } from 'shared/hooks/use-eth-usd';

import { TokenWstethIcon } from 'assets/earn';
import { useGGVWithdrawalRequests } from '../hooks/use-ggv-withdrawal-requests';
import type { GGVWithdrawalRequest } from '../types';

import {
  RequestsContainer,
  RequestSectionTitle,
  RequestEntryContainer,
  RequestIcon,
  RequestMainBalance,
  RequestSubBalance,
  RequestInfo,
  ButtonText,
} from './style';
import { useGGVCancelWithdraw } from '../hooks/use-ggv-cancel-withdraw';

type RequestEntryProps = {
  request: GGVWithdrawalRequest;
};

const RequestEntry = ({
  request,
  children,
}: React.PropsWithChildren<RequestEntryProps>) => {
  const { data: stETHAmount } = useStETHByWstETH(
    request.metadata.amountOfAssets,
  );
  const { usdAmount } = useEthUsd(stETHAmount);

  return (
    <RequestEntryContainer>
      <RequestIcon>
        <TokenWstethIcon viewBox="0 0 20 20" width={32} height={32} />
      </RequestIcon>
      <RequestMainBalance>
        <FormatToken
          symbol={getTokenDisplayName('wstETH')}
          amount={request.metadata.amountOfAssets}
        />
      </RequestMainBalance>
      <RequestSubBalance>
        <FormatPrice amount={usdAmount} />
      </RequestSubBalance>
      <RequestInfo>{children}</RequestInfo>
    </RequestEntryContainer>
  );
};

const PendingRequestEntry = ({ request }: RequestEntryProps) => {
  const { cancelGGVWithdraw, isLoading } = useGGVCancelWithdraw();

  return (
    <RequestEntry request={request}>
      created on {new Date(Number(request.timestamp) * 1000).toDateString()}
      <ButtonText
        disabled={isLoading}
        onClick={() => {
          void cancelGGVWithdraw(request);
        }}
      >
        Cancel
      </ButtonText>
    </RequestEntry>
  );
};

export const GGVWithdrawRequest = () => {
  const { data } = useGGVWithdrawalRequests();

  if (!data) return null;

  if (data.requests.openRequests.length > 0)
    return (
      <RequestsContainer>
        <RequestSectionTitle>Pending withdrawal request</RequestSectionTitle>
        {data.requests.openRequests.map((request) => (
          <PendingRequestEntry
            key={request.transaction_hash}
            request={request}
          />
        ))}
      </RequestsContainer>
    );

  if (data.requests.fulfilledRequests.length > 0) {
    const latest = data.requests.fulfilledRequests[0];

    <RequestsContainer>
      <RequestSectionTitle>Latest withdrawal request</RequestSectionTitle>
      <RequestEntry request={latest}>Completed on TODO</RequestEntry>
    </RequestsContainer>;
  }

  return null;
};
