import { FC, useContext, useEffect, useState } from 'react';
import { AppCookies, COOKIES_ALLOWED_KEY } from 'utils';
import { ThemeToggleContext } from '@lidofinance/lido-ui';
import CookieIconSrc from 'assets/icons/cookie.svg';
import CookieIconInverseSrc from 'assets/icons/cookieInverse.svg';
import {
  Wrap,
  Box,
  CookieWrap,
  Text,
  ButtonsWrap,
  AllowButton,
  DeclineButton,
  Link,
} from './styles';

export const CookiesTooltip: FC = () => {
  const [isVisible, setVisibility] = useState(false);

  useEffect(() => {
    if (AppCookies.getCookie(COOKIES_ALLOWED_KEY) === null) {
      setVisibility(true);
    }
  }, []);

  const {themeName} = useContext(ThemeToggleContext);

  if (!isVisible) return <></>;

  return (
    <Wrap>
      <Box>
        <CookieWrap>
          <img
            src={themeName == 'light' ? CookieIconSrc : CookieIconInverseSrc}
            alt="Cookie"
          />
        </CookieWrap>
        <Text>
          We use cookies to collect anonymous site visitation data
          to&nbsp;improve the performance of&nbsp;our&nbsp;website.
          For&nbsp;more info read our&nbsp;
          <Link href="https://lido.fi/privacy-notice">Privacy Notice</Link>
        </Text>
        <ButtonsWrap>
          <AllowButton
            onClick={() => {
              AppCookies.allowCookies();
              setVisibility(false);
            }}
          >
            Allow
          </AllowButton>
          <DeclineButton
            onClick={() => {
              AppCookies.declineCookies();
              setVisibility(false);
            }}
          >
            Decline
          </DeclineButton>
        </ButtonsWrap>
      </Box>
    </Wrap>
  );
};
