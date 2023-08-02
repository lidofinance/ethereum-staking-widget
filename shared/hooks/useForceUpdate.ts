// https://github.com/CharlesStover/use-force-update
import { useCallback, useState } from 'react';

export const useForceUpdate = () => {
  const [, dispatch] = useState<object>(Object.create(null));
  return useCallback(() => dispatch(Object.create(null)), []);
};
