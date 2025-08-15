import { useGGVWithdrawForm } from './form-context';

export const GGVWhenNoActiveRequests = ({
  children,
}: React.PropsWithChildren) => {
  const { hasActiveRequests } = useGGVWithdrawForm();

  if (hasActiveRequests) return null;

  return children;
};
