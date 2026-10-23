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

export const DexWrapper = styled.div<{ $consumeBottomSpace?: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;

  ${({ $consumeBottomSpace, theme }) =>
    $consumeBottomSpace &&
    css`
      margin-bottom: -${theme.spaceMap.md}px;

      ${({ theme }) => theme.mediaQueries.md} {
        margin-bottom: -${theme.spaceMap.lg}px;
      }
    `}
`;

const fadeOut = keyframes`
  from { opacity: var(--loader-opacity); }
  to   { opacity: 0; pointer-events: none; }
`;

export const LoaderStyled = styled(Loader)<{
  $isVisible: boolean;
  $maxWidth?: number;
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 100%;
  max-width: ${({ $maxWidth }) => ($maxWidth ? `${$maxWidth}px` : 'none')};
  height: 100%;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--custom-background-secondary);
  border-radius: 24px;

  // a narrowed loader sits over the banner corners, so it must not show through
  --loader-opacity: ${({ $maxWidth }) => ($maxWidth ? 1 : 0.8)};

  ${({ $isVisible }) =>
    $isVisible
      ? css`
          opacity: var(--loader-opacity);
        `
      : css`
          animation: ${fadeOut} 0.3s ease forwards;
          pointer-events: none;
        `}
`;
