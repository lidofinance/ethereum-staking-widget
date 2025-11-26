import React from 'react';
import { DisclaimerSectionStyled } from './styles';

export const DisclaimerSection = ({ children }: React.PropsWithChildren) => {
  return <DisclaimerSectionStyled>{children}</DisclaimerSectionStyled>;
};
