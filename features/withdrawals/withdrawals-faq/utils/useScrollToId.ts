import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export const useScrollToId = (id: string) => {
  const [opened, setOpened] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const pathParts = router.asPath.split('#');
    if (pathParts[pathParts.length - 1] === id) {
      setOpened(true);
    }
  }, [router.asPath, id]);

  return { id, opened };
};
