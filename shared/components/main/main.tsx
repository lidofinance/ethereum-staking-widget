import { FC } from 'react';
import { MainStyle } from './styles';

export const Main: FC = (props) => {
  return <MainStyle size="tight" forwardedAs="main" {...props} />;
};
