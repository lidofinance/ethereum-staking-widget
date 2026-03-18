import { ComponentProps, FC } from 'react';
import styled from 'styled-components';
import { Text as TextOriginal, themeDefault } from '@lidofinance/lido-ui';
import { devicesHeaderMedia } from 'styles/global';

type TextProps = Omit<ComponentProps<typeof TextOriginal>, 'color'> & {
  color?: keyof typeof themeDefault.colors;
};
export const Text: FC<TextProps> = styled(TextOriginal)<TextProps>`
  color: ${({ color }) => `var(--lido-color-${color ?? 'accentContrast'})`};
`;

export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: ${({ theme }) => theme.spaceMap.md}px;
  background-color: var(--lido-color-accent);
  border-radius: ${({ theme }) => theme.borderRadiusesMap.sm}px;
`;

export const CtaGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media ${devicesHeaderMedia.mobile} {
    flex-direction: column;
  }
`;

export const CtaLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 16px;
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  font-weight: 700;
  line-height: 1.5;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.sm}px;
  color: #273852;
  background-color: #fff;
  text-decoration: none;
  cursor: pointer;
  width: fit-content;
  transition: background-color 0.15s;

  &:visited {
    color: #273852;
  }

  &:hover {
    color: #273852;
    background-color: rgba(225, 225, 225, 1);
  }

  @media ${devicesHeaderMedia.mobile} {
    width: 100%;
  }
`;
