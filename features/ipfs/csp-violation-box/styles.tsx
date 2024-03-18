import { ComponentProps, FC } from 'react';
import styled from 'styled-components';
import { Text as TextOriginal, themeDefault } from '@lidofinance/lido-ui';
import { LinkArrow } from 'shared/components/link-arrow/link-arrow';

type TextProps = Omit<ComponentProps<typeof TextOriginal>, 'color'> & {
  color?: keyof typeof themeDefault.colors;
};
export const Text: FC<TextProps> = styled(TextOriginal)<TextProps>`
  color: ${({ color }) => `var(--lido-color-${color})`};
`;

export const Wrap = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;

  border-radius: ${({ theme }) => theme.borderRadiusesMap.sm}px;
  padding: ${({ theme }) => theme.spaceMap.md}px
    ${({ theme }) => theme.spaceMap.md}px;

  color: var(--lido-color-accentContrast);
  background-color: var(--lido-color-error);
`;

export const InfoLink = styled(LinkArrow)`
  font-weight: 700;

  &,
  &:visited,
  &:hover {
    color: var(--lido-color-accentContrast);
  }
`;
