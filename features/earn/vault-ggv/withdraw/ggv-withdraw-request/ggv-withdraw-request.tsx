import { FormatPrice, FormatToken } from 'shared/formatters';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';

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
import { useGGVAvailable } from '../../hooks/use-ggv-available';

type RequestEntryProps = {
  request: GGVWithdrawalRequest;
};

const RequestEntry = ({
  request,
  children,
}: React.PropsWithChildren<RequestEntryProps>) => {
  const { usdAmount } = useWstethUsd(request.metadata.amountOfAssets);

  return (
    <RequestEntryContainer>
      <RequestIcon>
        <TokenWstethIcon viewBox="0 0 20 20" width={32} height={32} />
      </RequestIcon>
      <RequestMainBalance>
        <FormatToken
          symbol={getTokenDisplayName('wstETH')}
          trimEllipsis
          amount={request.metadata.amountOfAssets}
          data-testid="request-amount"
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
      created on{' '}
      {new Date(Number(request.timestamp) * 1000).toLocaleDateString(
        undefined,
        {
          dateStyle: 'medium',
        },
      )}
      <ButtonText
        disabled={isLoading}
        onClick={(event) => {
          event.preventDefault();
          void cancelGGVWithdraw(request);
        }}
        data-testid="cancel-request-btn"
      >
        Cancel
      </ButtonText>
    </RequestEntry>
  );
};

export const GGVWithdrawRequest = () => {
  const { data } = useGGVWithdrawalRequests();
  const { isGGVAvailable } = useGGVAvailable();

  if (!data || !isGGVAvailable) return null;

  if (data.requests.openRequests.length > 0)
    return (
      <RequestsContainer data-testid="pending-request">
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

    return (
      <RequestsContainer data-testid="lts-request">
        <RequestSectionTitle>Latest withdrawal request</RequestSectionTitle>
        <RequestEntry request={latest.request}>
          Completed on{' '}
          {new Date(
            Number(latest.fulfillment.timestamp) * 1000,
          ).toLocaleDateString(undefined, {
            dateStyle: 'medium',
          })}
        </RequestEntry>
      </RequestsContainer>
    );
  }

  return null;
};
