import { useContext } from 'react';
import invariant from 'tiny-invariant';

import { UserConfigContext } from './provider';

export const useUserConfig = () => {
  const context = useContext(UserConfigContext);
  invariant(context, 'Attempt to use `client config` outside of provider');
  return context;
};
