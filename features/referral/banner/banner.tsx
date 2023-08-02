import { FC } from 'react';
import { Block, Link } from '@lidofinance/lido-ui';

import { BannerTextStyle, BannerHeader, BannerMainTextStyle } from './styles';

export const Banner: FC = () => {
  return (
    <Block>
      <BannerHeader>Whitelist mode is on</BannerHeader>
      <p>
        The Lido referral program transitioned to &apos;whitelist mode&apos;
        starting from 13.09.2021 / 00:00 UTC.
      </p>
      <br />
      <p>
        Only
        <Link href="https://docs.google.com/spreadsheets/d/13JO906tAVoPW9m0F1I39bxB2UIu7E41NSbxIFIzT18I/edit#gid=1322321646">
          &nbsp;whitelisted referral&nbsp;
        </Link>
        partners approved by the Lido DAO are eligible for rewards. To apply to
        Lido&apos;s whitelist you could here:
        <Link href="https://research.lido.fi/t/referral-program-whitelisting-ethereum/1039">
          {' '}
          https://research.lido.fi/t/referral-program-whitelisting-ethereum/1039
        </Link>
      </p>
      <br />
      <BannerMainTextStyle>
        All the other referral links don&apos;t get rewards anymore.
      </BannerMainTextStyle>
      <br />
      <BannerTextStyle>
        All rewards got before 13.09.2021 can be claimed via
        <Link href="https://app.rhino.fi/claim/lido-rewards"> Rhino.fi </Link>
        from 20.09.2021
      </BannerTextStyle>
      <br />
      <p>Thank you for participating!</p>
    </Block>
  );
};
