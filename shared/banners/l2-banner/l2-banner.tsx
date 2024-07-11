import { config } from 'config';

import { BannerLinkButton } from '../banner-link-button';
import { Wrapper, L2Icons, TextWrap, TextHeader, FooterWrap } from './styles';

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
  return (
    <Wrapper data-testid={testId}>
      {title && <TextHeader>{title}</TextHeader>}
      <TextWrap>{text}</TextWrap>
      <FooterWrap>
        <L2Icons />
        <BannerLinkButton
          href={buttonHref}
          testId={testidButton}
          onClick={onClickButton}
          isLocalLink={isLocalLink}
        >
          {buttonText}
        </BannerLinkButton>
      </FooterWrap>
    </Wrapper>
  );
};
