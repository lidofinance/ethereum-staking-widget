import {
  FC,
  useEffect,
  useState,
  useCallback,
  ComponentPropsWithoutRef,
  ReactNode,
} from 'react';
import { getCrossDomainCookieClientSide } from '@lidofinance/lido-ui';
import {
  Wrap,
  Box,
  Text,
  ButtonsWrap,
  AllowButton,
  DeclineButton,
  ExternalLink,
} from './styles';
import { allowCookies, declineCookies } from './utils';
import { COOKIE_ALLOWED_KEY } from './constants';

export type CookiesTooltipProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children'
> & {
  privacyText?: ReactNode;
  privacyLink?: string;
  privacyLinkEnabled?: boolean;
};

export const CookiesTooltip: FC<CookiesTooltipProps> = ({
  privacyText,
  privacyLink,
  privacyLinkEnabled = true,
  ...rest
}) => {
  const [isVisible, setVisibility] = useState(false);

  const checkCookieAllowedEarlier = useCallback(() => {
    // Check if user allowed/declined in other tab or third level domain
    if (getCrossDomainCookieClientSide(COOKIE_ALLOWED_KEY)) {
      setVisibility(false);

      window.removeEventListener('focus', checkCookieAllowedEarlier);
    }
  }, []);

  useEffect(() => {
    // Check cookie after page loaded
    if (getCrossDomainCookieClientSide(COOKIE_ALLOWED_KEY)) {
      return;
    }

    setVisibility(true);

    // This code runs after returned to this browser tab (window) from other
    window.addEventListener('focus', checkCookieAllowedEarlier);
  }, [checkCookieAllowedEarlier]);

  if (!isVisible) return <></>;

  return (
    <Wrap {...rest}>
      <Box>
        <Text>
          {privacyText ?? (
            <>
              Cookies are used to collect anonymous site visitation data
              to&nbsp;improve website performance.
              {privacyLinkEnabled && <>&nbsp;For&nbsp;more info, read&nbsp;</>}
            </>
          )}
          {privacyLinkEnabled && (
            <ExternalLink
              href={privacyLink ?? 'https://lido.fi/privacy-notice'}
            >
              Privacy Notice
            </ExternalLink>
          )}
        </Text>
        <ButtonsWrap>
          <AllowButton
            onClick={() => {
              allowCookies();
              setVisibility(false);
            }}
          >
            Allow
          </AllowButton>
          <DeclineButton
            onClick={() => {
              declineCookies();
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
