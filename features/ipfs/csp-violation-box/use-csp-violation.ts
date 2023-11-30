import { useEffect, useState } from 'react';

export const useCSPViolation = () => {
  const [isCSPViolated, setCSPViolated] = useState(false);

  useEffect(() => {
    const handler = () => {
      setCSPViolated(true);
    };
    document.addEventListener('securitypolicyviolation', handler);

    return () => {
      document.removeEventListener('securitypolicyviolation', handler);
    };
  }, []);

  return {
    isCSPViolated,
  };
};
