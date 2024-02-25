import { useContext } from 'react';
import invariant from 'tiny-invariant';
import { ConfigContext } from './provider';

export const useConfig = () => {
  const context = useContext(ConfigContext);
  invariant(context, 'Attempt to use `one config` outside of provider');
  return context;
};
