import styled from 'styled-components';

export const Amounts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spaceMap.xs}px;
`;

export const Amount = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spaceMap.xs}px;
  font-size: 18px;
  font-weight: 700;
`;

export const TokenIcon = styled.span`
  display: flex;
  width: 24px;
  height: 24px;

  & > svg {
    width: 100%;
    height: 100%;
  }
`;
