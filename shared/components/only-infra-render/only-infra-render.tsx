import { config } from 'config';

type OnlyInfraRenderProps = {
  renderIPFS?: React.ReactNode;
};

export const OnlyInfraRender = ({
  children,
  renderIPFS = null,
}: React.PropsWithChildren<OnlyInfraRenderProps>) => {
  return <>{config.ipfsMode ? renderIPFS : children}</>;
};
