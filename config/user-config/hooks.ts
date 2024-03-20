import { useContext, useMemo } from 'react';
import invariant from 'tiny-invariant';

import { ConfigContext } from '../provider';

export const useUserConfig = () => {
  const context = useContext(ConfigContext);
  invariant(context, 'Attempt to use `user config` outside of provider');
  return useMemo(() => context.userConfig, [context.userConfig]);
};
