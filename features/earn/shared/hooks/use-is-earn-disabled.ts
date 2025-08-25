import { useRouter } from 'next/router';
import { useIsIframe } from 'shared/hooks/use-is-iframe';

export const useIsEarnDisabled = () => {
  const { query } = useRouter();
  const isIframe = useIsIframe();

  // for embed - opt in
  // for others -  opt out
  return (isIframe && query.earn !== 'enabled') || query.earn === 'disabled';
};
