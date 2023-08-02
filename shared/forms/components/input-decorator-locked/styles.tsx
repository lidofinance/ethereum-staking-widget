import styled from 'styled-components';

export const LockWrapper = styled.span`
  position: relative;
  line-height: 0;
  padding: 4px;
  display: inline-block;
  vertical-align: top;
  margin-left: 8px;
  cursor: default;
  color: var(--lido-color-warning);
  border-radius: ${({ theme }) => theme.borderRadiusesMap.sm}px;

  :first-child {
    margin-left: 0;
  }

  &:before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    opacity: 0.1;
    background: currentColor;
    border-radius: inherit;
  }
`;
