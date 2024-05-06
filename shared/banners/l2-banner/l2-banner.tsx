import { config } from 'config';

import {
  Wrapper,
  L2Icons,
  TextWrap,
  ButtonLinkWrap,
  ButtonLinkWrapLocal,
  ButtonStyle,
  TextHeader,
  FooterWrap,
} from './styles';

type L2BannerProps = {
  title?: React.ReactNode;
  text: React.ReactNode;
  buttonText: React.ReactNode;
  buttonHref?: string;
  isLocalLink?: boolean;
  testId?: string;
  testidButton?: string;
  onClickButton?: () => void;
};

export const L2_DISCOVERY_LINK = `${config.rootOrigin}/lido-on-l2`;

export const L2Banner = ({
  title,
  text,
  buttonText,
  buttonHref = L2_DISCOVERY_LINK,
  isLocalLink,
  testId,
  testidButton,
  onClickButton,
}: L2BannerProps) => {
  const buttonEl = (
    <ButtonStyle data-testid={testidButton} size="sm" color="primary">
      {buttonText}
    </ButtonStyle>
  );

  const linkProps = {
    href: buttonHref,
    onClick: onClickButton,
    children: buttonEl,
  };

  const linkEl = isLocalLink ? (
    <ButtonLinkWrapLocal {...linkProps} />
  ) : (
    <ButtonLinkWrap {...linkProps} />
  );

  return (
    <Wrapper data-testid={testId}>
      {title && <TextHeader>{title}</TextHeader>}
      <TextWrap>{text}</TextWrap>
      <FooterWrap>
        <L2Icons />
        {linkEl}
      </FooterWrap>
    </Wrapper>
  );
};
