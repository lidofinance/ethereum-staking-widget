import styled from 'styled-components';
import { LocalLink } from 'shared/components/local-link';
import { ReactComponent as ChevronLeft } from 'assets/icons/chevron-left.svg';

export const LocalLinkStyled = styled(LocalLink)`
  display: inline-flex;
  text-decoration: none;
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  line-height: ${({ theme }) => theme.spaceMap.xl}px;
  margin-bottom: ${({ theme }) => theme.spaceMap.sm}px;

  font-weight: 400;

  &:link,
  &:visited {
    color: var(--lido-color-textSecondary);
  }

  &:hover {
    color: var(--lido-color-secondary);
  }
`;

export const ChevronLeftStyled = styled(ChevronLeft)`
  margin-right: ${({ theme }) => theme.spaceMap.sm}px;
`;
