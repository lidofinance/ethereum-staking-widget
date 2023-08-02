import { RequestItem } from './request-item';
import { RequestsEmpty } from './requests-empty';
import { Wrapper } from './styles';
import { RequestsLoader } from './requests-loader';
import { RequestStatusesUnion } from 'features/withdrawals/types/request-status';

type RequestsListProps = {
  isLoading: boolean;
  isEmpty: boolean;
  requests: RequestStatusesUnion[];
};

export const RequestsList: React.FC<RequestsListProps> = ({
  isLoading,
  isEmpty,
  requests,
}) => {
  if (isLoading) {
    return <RequestsLoader />;
  }

  if (isEmpty) {
    return <RequestsEmpty />;
  }

  return (
    <Wrapper>
      {requests.map((request) => (
        <RequestItem key={request.stringId} request={request} />
      ))}
    </Wrapper>
  );
};
