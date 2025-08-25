import styled from 'styled-components';

export const MessageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 12px;
`;

export const Message = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  line-height: 24px;
  font-weight: 700;
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 94px;
  height: 94px;
`;

export const Highlight = styled.span`
  color: var(--lido-color-success);
`;
