import {
  BannerContainer,
  BannerContent,
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
    <BannerContainer variant={variant}>
      {variant === 'warning' && <WarningIcon />}
      {variant === 'info' && <InfoWarningIcon />}
      <BannerContent variant={variant}>{children}</BannerContent>
    </BannerContainer>
  );
};

export const WarningBanner = ({
  children,
}: React.PropsWithChildren<BannerProps>) => {
  return <InfoBanner variant="warning">{children}</InfoBanner>;
};
