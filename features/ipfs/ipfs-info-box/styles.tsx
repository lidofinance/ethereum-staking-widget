import { ComponentProps, FC } from 'react';
import styled, { css } from 'styled-components';
import {
  ArrowBack,
  Button as ButtonOriginal,
  Link,
  Text as TextOriginal,
  themeDefault,
} from '@lidofinance/lido-ui';

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
  padding: ${({ theme }) => theme.spaceMap.md}px
    ${({ theme }) => theme.spaceMap.md}px;
  background-color: var(--lido-color-accent);
  border-radius: ${({ theme }) => theme.borderRadiusesMap.sm}px;

  &:after {
    content: '';
    position: absolute;
    top: -6px;
    right: 68px;
    display: block;
    width: 12px;
    height: 12px;
    transform: rotate(45deg);
    flex-shrink: 0;
    border-radius: 2px 0 0 0;
    background: var(--lido-color-accent);

    @media (max-width: ${themeDefault.breakpointsMap.lg}) {
      display: none;
    }
  }
`;

type RpcStatusBoxProps = {
  status: 'success' | 'error';
};
export const RpcStatusBox = styled.div<RpcStatusBoxProps>`
  display: flex;
  align-items: center;
  padding: 12px 8px;

  svg {
    flex: 0 0 auto;
    display: block;
  }

  ${({ status }) =>
    status === 'success'
      ? css`
          background-color: #53ba954d;
          border-radius: ${({ theme }) => theme.borderRadiusesMap.md}px;

          svg {
            color: var(--lido-color-success);
          }
        `
      : css`
          background-color: #e14d4d4d;
          border-radius: ${({ theme }) => theme.borderRadiusesMap.md}px;

          svg {
            color: var(--lido-color-error);
          }
        `}
`;

export const Button = styled(ButtonOriginal)`
  color: #273852;
  background-color: #fff;
  width: fit-content;

  &:not(:disabled):hover,
  &:focus-visible {
    background-color: rgba(225, 225, 225);
  }
`;

export const InfoLink = styled(Link)`
  display: flex;
  align-items: center;
  font-weight: 700;
  width: fit-content;

  &:hover svg {
    transform: rotate(180deg) translateX(-2px);
  }
`;

export const LinkArrow = styled(ArrowBack)`
  display: block;
  margin-left: 3px;
  width: 16px;
  height: 16px;
  transform: rotate(180deg);
  transition: transform ${({ theme }) => theme.ease.outCubic}
    ${({ theme }) => theme.duration.med};
`;
