import { FC } from 'react';
import buildInfo from 'build-info.json';
import { config } from 'config';
import { OnlyInfraRender } from 'shared/components/only-infra-render';

import {
  FooterStyle,
  FooterLink,
  LogoLidoStyle,
  FooterDivider,
  Version,
  LinkDivider,
} from './styles';
import { LinkToIpfs } from './link-to-ipfs';

const getVersionInfo = () => {
  const { version, branch } = buildInfo;
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
  if (version === 'staging' || version === 'dev') {
    return {
      label: version,
      link: `${repoBaseUrl}/tree/${branch}`,
    };
  }
  return {
    label: `v${version}`,
    link: `${repoBaseUrl}/releases/tag/${version}`,
  };
};

const { label, link } = getVersionInfo();

export const Footer: FC = () => {
  return (
    <FooterStyle size="full" forwardedAs="footer">
      <LogoLidoStyle />
      <OnlyInfraRender>
        <FooterLink
          data-testid="termsOfUse"
          href={`${config.rootOrigin}/terms-of-use`}
        >
          Terms of Use
        </FooterLink>
        <LinkDivider />
        <FooterLink
          data-testid="privacyNotice"
          href={`${config.rootOrigin}/privacy-notice`}
          $marginRight="auto"
        >
          Privacy Notice
        </FooterLink>
      </OnlyInfraRender>
      <LinkToIpfs />
      <Version data-testid="appVersion" href={link}>
        {label}
      </Version>
      <FooterDivider />
    </FooterStyle>
  );
};
