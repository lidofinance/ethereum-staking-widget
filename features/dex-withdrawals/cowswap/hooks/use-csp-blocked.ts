import { useState, useEffect } from 'react';

export const useCspBlocked = () => {
  const [cspBlocked, setCspBlocked] = useState<Error | null>(null);

  useEffect(() => {
    const handler = (e: SecurityPolicyViolationEvent) => {
      if (
        (e.violatedDirective === 'child-src' ||
          e.violatedDirective === 'frame-src') &&
        e.blockedURI.includes('cow.fi')
      ) {
        setCspBlocked(new Error('CSP blocked CoW widget iframe'));
      }
    };
    document.addEventListener('securitypolicyviolation', handler);
    return () =>
      document.removeEventListener('securitypolicyviolation', handler);
  }, []);

  if (cspBlocked) throw cspBlocked;

  return {
    cspBlocked,
  };
};
