import styled from 'styled-components';

export const Wrap = styled.div`
  padding: 16px;
  border-radius: 16px;
  background-color: ${({ theme }) =>
    theme.name === 'dark' ? '#28282f' : '#f2f3fc'};
`;

export const Title = styled.div`
  margin-bottom: 8px;
  font-size: 20px;
  line-height: 20px;
  font-weight: 700;
  color: var(--lido-color-text);
`;

export const Description = styled.div`
  margin-bottom: 15px;
  font-size: 12px;
  font-weight: 400;
  line-height: 20px;
  color: var(--lido-color-textSecondary);
`;

export const Footer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const Logos = styled.div`
  display: flex;
  gap: 8px;

  svg {
    display: block;
  }
`;
