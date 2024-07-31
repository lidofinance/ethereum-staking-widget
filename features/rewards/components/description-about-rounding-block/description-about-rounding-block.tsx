import { FC, PropsWithChildren } from 'react';

import { DescriptionAboutRoundingBlockStyled } from './styles';

export const DescriptionAboutRoundingBlock: FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <DescriptionAboutRoundingBlockStyled>
      {children}
    </DescriptionAboutRoundingBlockStyled>
  );
};
