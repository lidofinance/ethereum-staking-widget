import styled from 'styled-components';

export const SwitchWrapper = styled.div`
  width: 268px;
  height: 44px;
  background-color: ${({ theme }) => theme.colors.backgroundDarken};
  border-radius: 22px;
  position: relative;
  :hover {
    cursor: pointer;
  }
  display: flex;
  justify-content: space-around;
  align-items: center;
  user-select: none;
  margin: 0 auto 24px auto;
`;

export const Handle = styled.div<{ $checked: boolean }>`
  width: 132px;
  height: 40px;
  background-color: ${({ theme }) => theme.colors.foreground};
  border-radius: 20px;
  position: absolute;
  left: ${({ $checked }) => ($checked ? 'calc(100% - 134px)' : '2px')};
  transition: left 0.3s ease;
  top: 2px;
  z-index: 1;
`;

export const Label = styled.p<{ $checked: boolean }>`
  z-index: 2;
  margin: 0;
  opacity: ${({ $checked }) => ($checked ? 0.5 : 1)};
  transition: opacity 0.3s ease;
  line-height: 1.6em;
`;
