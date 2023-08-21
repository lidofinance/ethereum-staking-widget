import { Tooltip } from '@lidofinance/lido-ui';
import { useWaitingTime } from 'features/withdrawals/hooks/useWaitingTime';
import {
  RequestsStatusStyled,
  DesktopStatus,
  MobileStatusIcon,
  RequestInfoIcon,
} from './styles';
import { forwardRef } from 'react';

type RequestItemStatusProps = { status: 'ready' | 'pending' };

export const RequestStatus: React.FC<RequestItemStatusProps> = ({ status }) => {
  if (status === 'pending') return <RequestStatusPending />;
  return <RequestStatusBody status="ready" />;
};

const RequestStatusPending: React.FC = () => {
  const waitingTime = useWaitingTime('');
  return (
    <Tooltip title={`Current withdrawal period is ${waitingTime.value}.`}>
      <RequestStatusBody status="pending" />
    </Tooltip>
  );
};

const RequestStatusBody = forwardRef<
  HTMLDivElement,
  RequestItemStatusProps & React.ComponentProps<'div'>
>(({ status, ...props }, ref) => {
  const statusText = status === 'ready' ? 'Ready to claim' : 'Pending';
  return (
    <RequestsStatusStyled {...props} ref={ref} $variant={status}>
      <DesktopStatus>{statusText}</DesktopStatus>
      <MobileStatusIcon $variant={status} />
      {status === 'pending' && <RequestInfoIcon />}
    </RequestsStatusStyled>
  );
});
