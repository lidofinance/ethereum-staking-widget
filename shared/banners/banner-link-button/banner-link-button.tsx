import { ButtonLinkWrap, ButtonLinkWrapLocal, ButtonStyle } from './styles';

type BannerLinkButtonProps = {
  href: string;
  testId?: string;
  onClick?: () => void;
  isLocalLink?: boolean;
  children: React.ReactNode;
};

export const BannerLinkButton = ({
  href,
  testId,
  onClick,
  isLocalLink,
  children,
}: BannerLinkButtonProps) => {
  const buttonEl = (
    <ButtonStyle data-testid={testId} size="sm" color="primary">
      {children}
    </ButtonStyle>
  );

  const linkProps = {
    href,
    onClick,
    children: buttonEl,
  };

  if (isLocalLink) {
    return <ButtonLinkWrapLocal {...linkProps} />;
  }

  return <ButtonLinkWrap {...linkProps} />;
};
