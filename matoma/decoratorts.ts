import { MatomoEvent } from './type';
import { callMatomo } from './utils';

export const wrapWithEventTrack = <A extends unknown[], R>(
  event: MatomoEvent | void,
  fn: (...args: A) => R,
) =>
  event
    ? (...args: A): R => {
        callMatomo('trackEvent', ...event);
        return fn?.(...args);
      }
    : fn;
