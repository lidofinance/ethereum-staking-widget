import { GetStaticProps } from 'next';

import { FAQ_REVALIDATE_SECS, dynamics } from 'config';
import { StakePage, StakePageProps } from 'features/stake';
import HomePageIpfs, { HomePageIpfsProps } from 'features/ipfs/home-page-ipfs';
import { getFaqSSR } from 'utilsApi/faq';

export default dynamics.ipfsMode ? HomePageIpfs : StakePage;

export const getStaticProps: GetStaticProps<
  StakePageProps | HomePageIpfsProps
> = async () => {
  const stakePageFAQPath = '/faq-stake-page.md';

  // FAQ for IPFS SPA
  if (process.env.IPFS_MODE) {
    return {
      props: {
        stakePage: (await getFaqSSR(stakePageFAQPath)) ?? null,
        wrapPage: (await getFaqSSR('/faq-wrap-and-unwrap-page.md')) ?? null,
        withdrawalsPageRequest:
          (await getFaqSSR('/faq-withdrawals-page-request-tab.md')) ?? null,
        withdrawalsPageClaim:
          (await getFaqSSR('/faq-withdrawals-page-claim-tab.md')) ?? null,
      },
    };
  }

  // FAQ for stake page regular
  return {
    props: {
      pageFAQ: (await getFaqSSR(stakePageFAQPath))?.faq ?? null,
    },
    revalidate: FAQ_REVALIDATE_SECS,
  };
};
