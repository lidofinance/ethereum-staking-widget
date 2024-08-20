import styled from 'styled-components';

type TitleProps = {
  isCompact?: boolean;
};
export const Title = styled.div`
  margin-bottom: 8px;
  font-size: ${({ isCompact }: TitleProps) => (isCompact ? '16px' : '20px')};
  line-height: 1;
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
