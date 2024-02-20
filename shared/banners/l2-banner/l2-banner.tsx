import { ThemeProvider, themeDark } from '@lidofinance/lido-ui';

import {
  Wrapper,
  L2Icons,
  TextWrap,
  ButtonLinkWrap,
  ButtonStyle,
  TextHeader,
  FooterWrap,
} from './styles';

type L2BannerProps = {
  title?: React.ReactNode;
  text: React.ReactNode;
  buttonText: React.ReactNode;
  buttonHref?: string;
  testidWrap: string;
  testidButton: string;
  onClickButton?: () => void;
};

export const L2_DISCOVERY_LINK = 'https://lido.fi/lido-on-l2';

export const L2Banner = ({
  title,
  text,
  buttonText,
  buttonHref = L2_DISCOVERY_LINK,
  testidWrap,
  testidButton,
  onClickButton,
}: L2BannerProps) => {
  return (
    <Wrapper data-testid={testidWrap}>
      <ThemeProvider theme={themeDark}>
        {title && <TextHeader>{title}</TextHeader>}
        <TextWrap>{text}</TextWrap>
        <FooterWrap>
          <L2Icons />
          <ButtonLinkWrap
            href={buttonHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClickButton}
          >
            <ButtonStyle data-testid={testidButton} size="sm" color="primary">
              {buttonText}
            </ButtonStyle>
          </ButtonLinkWrap>
        </FooterWrap>
      </ThemeProvider>
    </Wrapper>
  );
};
