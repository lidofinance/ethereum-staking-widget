import styled, { keyframes } from 'styled-components';

export const enum StatusVariant {
  success = 'success',
  warning = 'warning',
  error = 'error',
}
type StatusProps = {
  $variant: keyof typeof StatusVariant;
};

const animationColorMap: Record<StatusVariant, string> = {
  [StatusVariant.success]: '83, 186, 149',
  [StatusVariant.warning]: '236, 134, 0',
  [StatusVariant.error]: '225, 77, 77',
};

export const pulseAnimation = (props: StatusProps) => keyframes`
  0% {  
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(${animationColorMap[props.$variant]}, 0.7);
  }
  70% {  
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(${animationColorMap[props.$variant]}, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(${animationColorMap[props.$variant]}, 0);
  }
`;

export const StatusStyled = styled.div<StatusProps>`
  border-radius: 50%;
  margin-right: ${({ theme }) => theme.spaceMap.sm}px;
  height: 8px;
  width: 8px;
  transform: scale(1);
  background: ${({ $variant }) => `var(--lido-color-${$variant})`};
  box-shadow: 0 0 0 0 ${({ $variant }) => `var(--lido-color-${$variant})`};
  animation-name: ${pulseAnimation};
  animation-duration: 2s;
  animation-iteration-count: infinite;
`;

export const StatusWrapperStyled = styled.div`
  display: flex;
  align-items: center;
`;
