import { ThemeProvider, themeDark } from '@lidofinance/lido-ui';

import {
  Wrapper,
  L2Icons,
  TextWrap,
  ButtonWrap,
  ButtonLinkWrap,
  ButtonStyle,
  ContentWrap,
  TextHeader,
} from './styles';

type L2BannerProps = {
  title: React.ReactNode;
  text: React.ReactNode;
  buttonText: React.ReactNode;
  buttonHref: string;
  testidWrap: string;
  testidButton: string;
  onClickButton?: () => void;
};

export const L2_DISCOVERY_LINK = 'https://lido.fi/lido-on-l2';

export const L2Banner = ({
  title,
  text,
  buttonText,
  buttonHref,
  testidWrap,
  testidButton,
  onClickButton,
}: L2BannerProps) => {
  return (
    <Wrapper data-testid={testidWrap}>
      <ThemeProvider theme={themeDark}>
        <ContentWrap>
          <TextHeader>{title}</TextHeader>
          <TextWrap>{text}</TextWrap>
          <ButtonWrap>
            <ButtonLinkWrap
              href={buttonHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClickButton}
            >
              <ButtonStyle
                data-testid={testidButton}
                size="sm"
                color="secondary"
              >
                {buttonText}
              </ButtonStyle>
            </ButtonLinkWrap>
          </ButtonWrap>
        </ContentWrap>
        <L2Icons />
      </ThemeProvider>
    </Wrapper>
  );
};
