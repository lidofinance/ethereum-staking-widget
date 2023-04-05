import styled from 'styled-components';

export const RequestCounterStyled = styled.span`
  margin-right: 16px;

  svg {
    margin-right: 8px;
    line-height: 0;
    vertical-align: middle;
    margin-top: -2px;
    border: 0;
    padding: 0;
  }

  &:not(:last-of-type) {
    padding-right: 16px;
    border-right: 1px solid rgba(255, 255, 255, 0.3);
  }

  &:last-of-type {
    margin-right: 0;
  }
`;
