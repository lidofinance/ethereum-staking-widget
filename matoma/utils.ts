import { MatomoEvent } from './type';

export const matomoAvailable =
  typeof window !== 'undefined' && window._paq !== undefined;

export const callMatomo = (apiMethod: string, ...args: unknown[]): void => {
  if (typeof window !== 'undefined') {
    window?._paq?.push([apiMethod, ...args]);
  }
};

export const trackEvent = (...event: MatomoEvent): void => {
  callMatomo('trackEvent', ...event);
};
