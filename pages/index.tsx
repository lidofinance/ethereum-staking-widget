import { GetStaticProps } from 'next';

import { FAQ_REVALIDATE_SECS, dynamics } from 'config';
import HomePageRegular, {
  HomePageRegularProps,
} from 'features/home/home-page-regular';
import HomePageIpfs, { HomePageIpfsProps } from 'features/ipfs/home-page-ipfs';
import { getFaqSSR } from 'utilsApi/faq';

export default dynamics.ipfsMode ? HomePageIpfs : HomePageRegular;

export const getStaticProps: GetStaticProps<
  HomePageRegularProps | HomePageIpfsProps
> = async () => {
  const stakePageFAQPath = '/faq-stake-page.md';

  // FAQ for IPFS SPA
  if (process.env.IPFS_MODE) {
    const stakePageFAQ = await getFaqSSR(stakePageFAQPath);
    const wrapPageFAQ = await getFaqSSR('/faq-wrap-and-unwrap-page.md');
    const withdrawalsPageRequestFAQ = await getFaqSSR(
      '/faq-withdrawals-page-request-tab.md',
    );
    const withdrawalsPageClaimFAQ = await getFaqSSR(
      '/faq-withdrawals-page-claim-tab.md',
    );

    return {
      props: {
        stakePage: {
          faq: stakePageFAQ?.faq,
          eTag: stakePageFAQ?.eTag,
        },
        wrapPage: {
          faq: wrapPageFAQ?.faq,
          eTag: wrapPageFAQ?.eTag,
        },
        withdrawalsPageRequest: {
          faq: withdrawalsPageRequestFAQ?.faq,
          eTag: withdrawalsPageRequestFAQ?.eTag,
        },
        withdrawalsPageClaim: {
          faq: withdrawalsPageClaimFAQ?.faq,
          eTag: withdrawalsPageClaimFAQ?.eTag,
        },
      },
    };
  }

  // FAQ for home page regular
  return {
    props: {
      pageFAQ: (await getFaqSSR(stakePageFAQPath))?.faq,
    },
    revalidate: FAQ_REVALIDATE_SECS,
  };
};
