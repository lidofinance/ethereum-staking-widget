import { EventSubscription } from 'utils/event-subscription';
import { useCallback, useMemo } from 'react';

export const useFormControllerRetry = () => {
  const retryEvent = useMemo(() => new EventSubscription(), []);

  const retryFire = useCallback(() => {
    retryEvent.fire();
  }, [retryEvent]);

  return {
    retryFire,
    retryEvent,
  };
};
