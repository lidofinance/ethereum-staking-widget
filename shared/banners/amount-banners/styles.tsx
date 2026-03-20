import styled, { css } from 'styled-components';
import { devicesHeaderMedia } from 'styles/global';

const modalStyles = css`
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  background: radial-gradient(
      ellipse 70% 90% at 50% 50%,
      #00a3ff -60%,
      rgba(0, 163, 255, 0) 80%
    ),
    var(--lido-color-accent);
`;

export const Wrapper = styled.div<{ $isModal?: boolean; $marginTop?: number }>`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spaceMap.md}px 20px;
  border-radius: 16px;
  background: linear-gradient(-115deg, #00a3ff -10%, rgba(0, 163, 255, 0) 60%),
    var(--lido-color-accent);
  color: #fff;
  width: 260px;
  text-align: left;

  ${({ $isModal }) => $isModal && modalStyles}
  margin-top: ${({ $marginTop }) => ($marginTop ? `${$marginTop}px` : 0)};

  @media ${devicesHeaderMedia.mobile} {
    ${modalStyles}
    margin-top: ${({ $marginTop }) => ($marginTop ? `${$marginTop}px` : 0)};
  }
`;

export const HeaderStyled = styled.span`
  font-size: ${({ theme }) => theme.fontSizesMap.sm}px;
  line-height: 24px;
  font-weight: 400;
`;

export const DescriptionStyled = styled.span`
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  line-height: 20px;
  font-weight: 400;
  margin-top: 4px;
`;

export const CtaGroup = styled.div<{ $isModal?: boolean }>`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 20px;

  ${({ $isModal }) =>
    $isModal &&
    css`
      flex-wrap: nowrap;
    `}

  @media ${devicesHeaderMedia.mobile} {
    flex-wrap: nowrap;
  }
`;

export const CtaLink = styled.a<{ $isModal?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  font-weight: 700;
  line-height: 24px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.sm}px;
  color: #273852;
  background-color: #fff;
  text-decoration: none;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.15s;
  order: 2;

  &:visited {
    color: #273852;
  }

  &:hover {
    color: #273852;
    background-color: rgba(225, 225, 225, 1);
  }

  &:nth-child(2) {
    background-color: unset;
    color: #fff;
    border: 1px solid #fff;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  ${({ $isModal }) =>
    $isModal &&
    css`
      &:nth-child(2) {
        order: 1;
      }
    `}

  @media ${devicesHeaderMedia.mobile} {
    width: 100%;

    &:last-child {
      order: 1;
    }
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--lido-color-accentContrast);
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
`;
