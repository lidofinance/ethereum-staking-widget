import { dynamics } from 'config';

export const OnlyInfraRender = ({ children }: React.PropsWithChildren) => {
  return !dynamics.ipfsMode ? <>{children}</> : null;
};
