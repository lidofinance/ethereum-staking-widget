import { useEffect, useState } from 'react';

const checkUnlocked = (unlockTimeSeconds: number) => {
  return unlockTimeSeconds >= Date.now() / 1000;
};

const CHECK_INTERVAL = 10_000;

export const useIsUnlocked = (unlockTimeSeconds: number) => {
  const [unlocked, setUnlocked] = useState(checkUnlocked(unlockTimeSeconds));

  useEffect(() => {
    const isUnlocked = checkUnlocked(unlockTimeSeconds);
    setUnlocked(isUnlocked);
    if (!isUnlocked) {
      const interval = setInterval(() => {
        setUnlocked(checkUnlocked(unlockTimeSeconds));
      }, CHECK_INTERVAL);

      return () => {
        clearInterval(interval);
      };
    }
  }, [unlockTimeSeconds]);

  return unlocked;
};
