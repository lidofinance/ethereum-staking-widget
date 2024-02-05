import { Delegate } from 'utils/delegate';
import { useCallback, useMemo } from 'react';

export const useFormControllerRetry = () => {
  const retryDelegate = useMemo(() => new Delegate(), []);

  const retryFire = useCallback(() => {
    retryDelegate.fire();
  }, [retryDelegate]);

  return {
    retryFire,
    retryDelegate,
  };
};
