import { dynamics } from 'config';

type OnlyInfraRenderProps = {
  placeholder?: React.ReactNode;
};

export const OnlyInfraRender = ({
  children,
  placeholder = null,
}: React.PropsWithChildren<OnlyInfraRenderProps>) => {
  return <>{dynamics.ipfsMode ? placeholder : children}</>;
};
