import { FC, useEffect, useState } from 'react';
import { AppCookies, COOKIES_ALLOWED_KEY } from 'utils';
import CookieIconSrc from 'assets/icons/cookie.svg';
import {
  Wrap,
  Box,
  CookieWrap,
  Text,
  ButtonsWrap,
  ButtonFilled,
  ButtonGhost,
  Link,
} from './styles';

export const CookiesTooltip: FC = () => {
  const [isVisible, setVisibility] = useState(false);

  useEffect(() => {
    if (AppCookies.getCookie(COOKIES_ALLOWED_KEY) === null) {
      setVisibility(true);
    }
  }, []);

  if (!isVisible) return <></>;

  return (
    <Wrap>
      <Box>
        <CookieWrap>
          <img src={CookieIconSrc} alt="" />
        </CookieWrap>
        <Text>
          We use cookies to collect anonymous site visitation data
          to&nbsp;improve the performance of&nbsp;our&nbsp;website.
          For&nbsp;more info read our&nbsp;
          <Link href="https://lido.fi/privacy-notice">Privacy Notice</Link>
        </Text>
        <ButtonsWrap>
          <ButtonFilled
            onClick={() => {
              AppCookies.allowCookies();
              setVisibility(false);
            }}
          >
            Allow
          </ButtonFilled>
          <ButtonGhost
            onClick={() => {
              AppCookies.declineCookies();
              setVisibility(false);
            }}
          >
            Decline
          </ButtonGhost>
        </ButtonsWrap>
      </Box>
    </Wrap>
  );
};
