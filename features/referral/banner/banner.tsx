import { FC } from 'react';
import { Block, Link } from '@lidofinance/lido-ui';

import { BannerTextStyle, BannerHeader, BannerMainTextStyle } from './styles';

export const Banner: FC = () => {
  return (
    <Block>
      <BannerHeader>Whitelist mode is on</BannerHeader>
      <p>
        The Lido referral program transitioned to &apos;whitelist mode&apos;
        starting from 13.09 / 00:00 UTC. Only whitelisted referral partners
        approved by the Lido DAO are eligible for rewards.
      </p>
      <BannerMainTextStyle>
        All the other referral links don&apos;t earn rewards anymore.
      </BannerMainTextStyle>
      <BannerTextStyle>
        All rewards earned before 13.09 can be claimed via
        <Link href="https://app.rhino.fi/claim/lido-rewards"> DeversiFi </Link>
        from 20.09.
      </BannerTextStyle>
      <p>Thank you for participating!</p>
    </Block>
  );
};
