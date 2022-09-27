import { FC } from 'react';
import { Block, Link } from '@lidofinance/lido-ui';

import { BannerTextStyle, BannerHeader, BannerMainTextStyle } from './styles';

export const Banner: FC = () => {
  return (
    <Block>
      <BannerHeader>Whitelist mode is on</BannerHeader>
      <p>
        The Lido referral program transitioned to &apos;whitelist mode&apos;
        starting from 13.09.2021 / 00:00 UTC. Only
        <Link href="https://docs.google.com/spreadsheets/d/13JO906tAVoPW9m0F1I39bxB2UIu7E41NSbxIFIzT18I/edit#gid=1322321646">
          &nbsp;whitelisted referral partners approved by the Lido DAO&nbsp;
        </Link>
        are eligible for rewards.
      </p>
      <br />
      <BannerMainTextStyle>
        All the other referral links don&apos;t earn rewards anymore.
      </BannerMainTextStyle>
      <br />
      <BannerTextStyle>
        All rewards earned before 13.09.2021 can be claimed via
        <Link href="https://app.rhino.fi/claim/lido-rewards"> DeversiFi </Link>
        from 20.09.2021.
      </BannerTextStyle>
      <br />
      <p>Thank you for participating!</p>
    </Block>
  );
};
