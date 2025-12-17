import {
  WarningContainer,
  WarningContent,
  WarningIcon,
  InfoWarningIcon,
} from './styles';

export type BannerProps = {
  variant?: 'warning' | 'info';
};

export const InfoBanner = ({
  children,
  variant = 'info',
}: React.PropsWithChildren<BannerProps>) => {
  return (
    <WarningContainer variant={variant} data-testid="vault-warning">
      {variant === 'warning' && <WarningIcon />}
      {variant === 'info' && <InfoWarningIcon />}
      <WarningContent variant={variant}>{children}</WarningContent>
    </WarningContainer>
  );
};

export const WarningBanner = ({
  children,
}: React.PropsWithChildren<BannerProps>) => {
  return <InfoBanner variant="warning">{children}</InfoBanner>;
};
