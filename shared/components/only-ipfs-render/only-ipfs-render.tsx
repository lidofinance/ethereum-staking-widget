import { config } from 'config';

export const OnlyIpfsRender = ({ children }: React.PropsWithChildren) => {
  return config.ipfsMode ? <>{children}</> : null;
};
