import styled, { css } from 'styled-components';
import WarningIconSrc from 'assets/icons/attention-triangle.svg';
import InfoIconSrc from 'assets/icons/info-warning.svg';

type VaultWarningVariantProps = {
  variant?: 'warning' | 'info';
};

type VaultWarningStyleProps = VaultWarningVariantProps & {
  $centered?: boolean;
};

type VaultWarningProps = VaultWarningVariantProps & {
  // replaces the variant's default icon, e.g. with a spinner
  icon?: React.ReactNode;
  // centers the icon + text group instead of stretching the text to full width
  centered?: boolean;
};

export const WarningIcon = styled.img.attrs({
  src: WarningIconSrc,
  alt: 'warning',
})`
  display: block;
  width: 24px;
  height: 24px;
`;

export const InfoWarningIcon = styled.img.attrs({
  src: InfoIconSrc,
  alt: 'info',
})`
  display: block;
  width: 14px;
  height: 14px;
  margin: 5px;
`;

const WarningContainer = styled.div<VaultWarningStyleProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: ${({ $centered }) => ($centered ? 'center' : 'flex-start')};
  gap: ${({ theme }) => theme.spaceMap.sm}px;
  padding: ${({ theme }) => theme.spaceMap.md}px;

  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  background-color: #fdf3e5;

  ${({ variant }) =>
    variant === 'info' &&
    css`
      background-color: ${({ theme }) =>
        theme.name === 'light' ? `#F6F7F8` : 'var(--lido-color-controlBg)'};
    `}

  ${({ theme }) => theme.mediaQueries.md} {
    padding: 12px;
  }
`;

const WarningContent = styled.div<VaultWarningStyleProps>`
  flex: ${({ $centered }) => ($centered ? '0 1 auto' : 1)};

  font-size: 12px;
  font-weight: 700;
  line-height: 20px;

  ${({ theme }) => theme.mediaQueries.md} {
    padding-right: 0px;
  }

  color: var(--lido-color-warning);
  ${({ variant }) =>
    variant === 'info' &&
    css`
      font-weight: 400;
      color: var(--lido-color-textSecondary);
    `}
`;

export const VaultWarning = ({
  children,
  variant = 'warning',
  icon,
  centered,
}: React.PropsWithChildren<VaultWarningProps>) => {
  return (
    <WarningContainer
      variant={variant}
      $centered={centered}
      data-testid="vault-warning"
    >
      {icon ?? (variant === 'warning' ? <WarningIcon /> : <InfoWarningIcon />)}
      <WarningContent variant={variant} $centered={centered}>
        {children}
      </WarningContent>
    </WarningContainer>
  );
};
