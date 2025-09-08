import { useSsrMode } from './useSsrMode';

export const useIsIframe = () => {
  const isSSR = useSsrMode();

  const isIframe = () => {
    try {
      return (
        !isSSR && typeof window !== 'undefined' && window.top !== window.self
      );
    } catch (e) {
      return true;
    }
  };

  return isIframe();
};
