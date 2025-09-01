import { useGGVAvailable } from '../hooks/use-ggv-available';
import { useGGVWithdrawForm } from './form-context';

export const GGVWhenNoActiveRequests = ({
  children,
}: React.PropsWithChildren) => {
  const { isGGVAvailable } = useGGVAvailable();
  const { hasActiveRequests } = useGGVWithdrawForm();

  // shows disabled form on wrong chain
  if (hasActiveRequests && isGGVAvailable) return null;

  return children;
};
