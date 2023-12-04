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
    return {
      props: {
        stakePage: (await getFaqSSR(stakePageFAQPath)) ?? undefined,
        wrapPage:
          (await getFaqSSR('/faq-wrap-and-unwrap-page.md')) ?? undefined,
        withdrawalsPageRequest:
          (await getFaqSSR('/faq-withdrawals-page-request-tab.md')) ??
          undefined,
        withdrawalsPageClaim:
          (await getFaqSSR('/faq-withdrawals-page-claim-tab.md')) ?? undefined,
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
