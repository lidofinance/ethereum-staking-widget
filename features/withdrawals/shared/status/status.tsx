import { FC } from 'react';

import { StatusStyled, StatusWrapperStyled, StatusVariant } from './styles';

export type StatusProps = {
  variant: keyof typeof StatusVariant;
};

export const Status: FC<StatusProps> = ({ children, variant }) => {
  return (
    <StatusWrapperStyled>
      <StatusStyled $variant={variant} />
      {children}
    </StatusWrapperStyled>
  );
};
