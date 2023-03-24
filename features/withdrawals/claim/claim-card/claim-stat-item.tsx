import { FC } from 'react';

import { FormatTokenProps } from 'shared/formatters/format-token';

import {
  ClaimStatItemTitleStyled,
  ClaimStatItemWrapperStyled,
  FormatTokenStyled,
} from './styles';

export type ClaimStatItemProps = FormatTokenProps & {
  $bold?: boolean;
  title: string;
};

export const ClaimStatItem: FC<ClaimStatItemProps> = (props) => {
  const { title, $bold, ...rest } = props;

  return (
    <ClaimStatItemWrapperStyled $bold={$bold}>
      <ClaimStatItemTitleStyled>{title}</ClaimStatItemTitleStyled>
      <FormatTokenStyled {...rest} />
    </ClaimStatItemWrapperStyled>
  );
};
