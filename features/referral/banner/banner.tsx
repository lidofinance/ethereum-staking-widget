import { FC } from 'react';
import { Block, Link } from '@lidofinance/lido-ui';

import { BannerTextStyle, BannerHeader, BannerMainTextStyle } from './styles';

// TODO: add link
export const Banner: FC = () => {
  return (
    <Block>
      <BannerHeader>Referral program whitelisting</BannerHeader>
      <p>
        The Lido referral program will transition to &apos;whitelist mode&apos;
        starting from 13.09 / 00:00 UTC. Only whitelisted referral partners
        approved by the Lido DAO will be eligible for rewards.
      </p>
      <BannerMainTextStyle>
        All the other referral links would not earn rewards anymore.
      </BannerMainTextStyle>
      <BannerTextStyle>
        All rewards earned before 13.09 can be claimed via
        <Link href=""> DeversiFi </Link> from 20.09.
      </BannerTextStyle>
      <p>Thank you for participating!</p>
    </Block>
  );
};
