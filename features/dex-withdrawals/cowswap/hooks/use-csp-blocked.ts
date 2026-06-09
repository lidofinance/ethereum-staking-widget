import { useState, useEffect } from 'react';
import { COWSWAP_BASE_URL } from '../consts';

export const useCspBlocked = () => {
  const [cspBlocked, setCspBlocked] = useState<Error | null>(null);

  useEffect(() => {
    const handler = (e: SecurityPolicyViolationEvent) => {
      const COWSWAP_BASE = new URL(COWSWAP_BASE_URL).origin;

      if (
        (e.violatedDirective === 'child-src' ||
          e.violatedDirective === 'frame-src') &&
        e.blockedURI.includes(COWSWAP_BASE)
      ) {
        setCspBlocked(new Error('CSP blocked CoW widget iframe'));
      }
    };
    document.addEventListener('securitypolicyviolation', handler);
    return () =>
      document.removeEventListener('securitypolicyviolation', handler);
  }, []);

  if (cspBlocked) throw cspBlocked;
};
