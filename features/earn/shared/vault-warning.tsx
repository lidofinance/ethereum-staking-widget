import styled from 'styled-components';
import WarningIconSrc from 'assets/icons/attention-triangle.svg';

export const WarningIcon = styled.img.attrs({
  src: WarningIconSrc,
  alt: 'warning',
})`
  display: block;
  width: 24px;
  height: 24px;
`;

const WarningContainer = styled.div`
  display: flex;
  flex-direction: row;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  padding: ${({ theme }) => theme.spaceMap.md}px;
  background-color: #fdf3e5;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
`;

const WarningContent = styled.div`
  flex: 1;

  padding-right: calc(
    ${({ theme }) => theme.spaceMap.xl}px +
      ${({ theme }) => theme.spaceMap.sm}px
  );

  color: var(--lido-color-warning);
  font-size: 12px;
  font-weight: 700;
  line-height: 20px;
`;

export const VaultWarning = ({ children }: React.PropsWithChildren) => {
  return (
    <WarningContainer>
      <WarningIcon />
      <WarningContent>{children}</WarningContent>
    </WarningContainer>
  );
};
