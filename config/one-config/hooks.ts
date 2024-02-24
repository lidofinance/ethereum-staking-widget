import { useContext } from 'react';
import invariant from 'tiny-invariant';
import { OneConfigContext } from './provider';

export const useOneConfig = () => {
  const context = useContext(OneConfigContext);
  invariant(context, 'Attempt to use `one config` outside of provider');
  return context;
};
