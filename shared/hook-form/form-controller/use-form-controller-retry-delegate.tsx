import { EventSubsciption } from 'utils/event-subsciption';
import { useCallback, useMemo } from 'react';

export const useFormControllerRetry = () => {
  const retryEvent = useMemo(() => new EventSubsciption(), []);

  const retryFire = useCallback(() => {
    retryEvent.fire();
  }, [retryEvent]);

  return {
    retryFire,
    retryEvent,
  };
};
