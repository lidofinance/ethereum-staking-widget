import { dynamics } from 'config';

export const OnlyIpfsRender = ({ children }: React.PropsWithChildren) => {
  return dynamics.ipfsMode ? <>{children}</> : null;
};
