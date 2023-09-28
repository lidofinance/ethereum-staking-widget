import { FC, PropsWithChildren } from 'react';

import { StatusStyled, StatusWrapperStyled, StatusVariant } from './styles';

export type StatusProps = {
  variant: keyof typeof StatusVariant;
};

export const Status: FC<PropsWithChildren<StatusProps>> = ({
  children,
  variant,
}) => {
  return (
    <StatusWrapperStyled>
      <StatusStyled $variant={variant} />
      {children}
    </StatusWrapperStyled>
  );
};
