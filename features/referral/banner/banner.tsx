import { FC } from 'react';

import { BannerImage, BannerBox } from 'features/referral/components';

export const Banner: FC = () => {
  return (
    <BannerBox>
      <BannerImage />
      <h2>Referral program whitelisting</h2>
      <p>
        The Lido referral program will transition to &apos;whitelist mode&apos;
        starting from 13.09 / 00:00 UTC. Only whitelisted referral partners
        approved by the Lido DAO will be eligible for rewards. All the other
        referral links would not earn rewards anymore. All rewards earned before
        13.09 can be claimed via DeversiFi from 20.09. Thank you for
        participating!
      </p>
    </BannerBox>
  );
};
