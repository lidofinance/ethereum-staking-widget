import styled from 'styled-components';
import { ReactComponent as InfoCircle } from 'assets/icons/info-circle.svg';

export const Wrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px;
  border: 1px solid var(--lido-color-border);
  border-radius: ${({ theme }) => theme.borderRadiusesMap.xl}px;
  background: var(--lido-color-foreground);
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  line-height: 22px;
  font-weight: 400;
  text-align: left;

  ${({ theme }) => theme.mediaQueries.md} {
    padding: ${({ theme }) => theme.spaceMap.md}px;
  }
`;

export const InfoIcon = styled(InfoCircle)`
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
  margin-top: 1px;
  color: var(--lido-color-primary);
`;

export const Text = styled.p`
  flex: 1 1 auto;
  margin: 0;
  color: var(--lido-color-textSecondary);
`;

export const Title = styled.span`
  color: var(--lido-color-text);
`;

export const CloseButton = styled.button`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--lido-color-textSecondary);

  &:hover {
    color: var(--lido-color-text);
  }
`;
