import { RequestsStatusStyled, StatusIcon, StatusText } from './styles';
import { forwardRef } from 'react';
import { formatTimestamp } from '../../../utils/format-timestamp';
import { useBreakpoint } from '@lidofinance/lido-ui';

type RequestItemStatusProps = {
  status: 'ready' | 'pending';
  finalizationAt: string | null;
};

export const RequestStatus: React.FC<RequestItemStatusProps> = (props) => {
  return <RequestStatusBody {...props} />;
};

const RequestStatusBody = forwardRef<
  HTMLDivElement,
  RequestItemStatusProps & React.ComponentProps<'div'>
>(({ status, finalizationAt, ...props }, ref) => {
  let statusText;
  const isMobile = useBreakpoint('md');

  if (status.toLocaleLowerCase() === 'ready') {
    statusText = 'Ready';
  } else if (finalizationAt) {
    statusText = formatTimestamp(finalizationAt, isMobile);
  } else {
    statusText = 'Pending';
  }

  return (
    <RequestsStatusStyled {...props} ref={ref} $variant={status}>
      <StatusIcon $variant={status} />
      <StatusText>{statusText}</StatusText>
    </RequestsStatusStyled>
  );
});
