import { GetStaticProps } from 'next';

import { FAQ_REVALIDATE_SECS, dynamics } from 'config';
import HomePageRegular, {
  HomePageRegularProps,
} from 'features/home/home-page-regular';
import HomePageIpfs, { HomePageIpfsProps } from 'features/ipfs/home-page-ipfs';
import { getFAQ } from 'utilsApi/get-faq';

export default dynamics.ipfsMode ? HomePageIpfs : HomePageRegular;

export const getStaticProps: GetStaticProps<
  HomePageRegularProps | HomePageIpfsProps
> = async () => {
  const stakePageFAQPath = 'ethereum-staking-widget/faq-stake-page.md';

  // FAQ for IPFS SPA
  if (process.env.IPFS_MODE) {
    return {
      props: {
        stakePageFAQ: await getFAQ(stakePageFAQPath),
        wrapModePageFAQ: await getFAQ(
          'ethereum-staking-widget/faq-wrap-and-unwrap-page.md',
        ),
        withdrawalsPageRequestFAQ: await getFAQ(
          'ethereum-staking-widget/faq-withdrawals-page-request-tab.md',
        ),
        withdrawalsPageClaimFAQ: await getFAQ(
          'ethereum-staking-widget/faq-withdrawals-page-claim-tab.md',
        ),
      },
      revalidate: FAQ_REVALIDATE_SECS,
    };
  }

  // FAQ for home page regular
  return {
    props: {
      pageFAQ: await getFAQ(stakePageFAQPath),
    },
    revalidate: FAQ_REVALIDATE_SECS,
  };
};
