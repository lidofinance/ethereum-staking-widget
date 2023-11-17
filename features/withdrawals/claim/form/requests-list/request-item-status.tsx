import {
  RequestsStatusStyled,
  DesktopStatus,
  StatusIcon,
  MobileStatus,
} from './styles';
import { forwardRef } from 'react';
import { formatTimestamp } from '../../../utils/format-timestamp';

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
  let statusTextMobile;

  if (status === 'ready') {
    statusText = 'Ready';
    statusTextMobile = 'Ready';
  } else if (finalizationAt) {
    statusText = formatTimestamp(finalizationAt);
    statusTextMobile = formatTimestamp(finalizationAt, true);
  } else {
    statusText = 'Pending';
    statusTextMobile = 'Pending';
  }

  return (
    <RequestsStatusStyled {...props} ref={ref} $variant={status}>
      <StatusIcon $variant={status} />
      <DesktopStatus>{statusText}</DesktopStatus>
      <MobileStatus>{statusTextMobile}</MobileStatus>
    </RequestsStatusStyled>
  );
});
