import { FC } from 'react';
import { version, branch } from 'build-info.json';

import {
  FooterStyle,
  FooterLink,
  LogoLidoStyle,
  FooterDivider,
  Version,
  LinkDivider,
} from './styles';

const getVersionInfo = () => {
  const repoBaseUrl = 'https://github.com/lidofinance/ethereum-staking-widget';
  if (version === 'REPLACE_WITH_VERSION')
    return {
      label: 'dev',
      link: repoBaseUrl,
    };
  if (version === branch + ':-unknown')
    return {
      label: 'preview',
      link: `${repoBaseUrl}/tree/${branch}`,
    };
  return {
    label: `v${version}`,
    link: `${repoBaseUrl}/releases/tag/${version}`,
  };
};

const { label, link } = getVersionInfo();

export const Footer: FC = () => (
  <FooterStyle size="full" forwardedAs="footer">
    <LogoLidoStyle />
    <FooterLink data-testid="termsOfUse" href="https://lido.fi/terms-of-use">
      Terms of Use
    </FooterLink>
    <LinkDivider />
    <FooterLink
      data-testid="privacyNotice"
      href="https://lido.fi/privacy-notice"
    >
      Privacy Notice
    </FooterLink>
    <Version href={link}>{label}</Version>
    <FooterDivider />
  </FooterStyle>
);
