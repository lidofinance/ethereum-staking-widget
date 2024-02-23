import { useContext } from 'react';
import invariant from 'tiny-invariant';

import { ClientConfigContext } from './provider';

// TODO: 'useClientConfig' --> 'useUserConfig'
export const useClientConfig = () => {
  const context = useContext(ClientConfigContext);
  invariant(context, 'Attempt to use `client config` outside of provider');
  return context;
};
