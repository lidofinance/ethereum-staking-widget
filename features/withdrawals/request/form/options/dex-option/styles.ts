import { Loader } from '@lidofinance/lido-ui';
import styled, { css, keyframes } from 'styled-components';

export const FallbackContainer = styled.div`
  display: flex;

  height: 200px;
  padding: 0 24px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  align-self: stretch;

  border-radius: 10px;
  background-color: var(--custom-background-secondary);

  h2 {
    color: var(--lido-color-text);
    font-size: 14px;
    font-weight: 700;
  }

  span {
    color: var(--lido-color-textSecondary);
    font-size: 12px;
    font-weight: 400;
    text-align: center;
  }
`;

export const DexWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const fadeOut = keyframes`
  from { opacity: 0.8; }
  to   { opacity: 0; pointer-events: none; }
`;

export const LoaderStyled = styled(Loader)<{ $isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--custom-background-secondary);
  border-radius: 24px;

  ${({ $isVisible }) =>
    $isVisible
      ? css`
          opacity: 0.8;
        `
      : css`
          animation: ${fadeOut} 0.3s ease forwards;
          pointer-events: none;
        `}
`;
