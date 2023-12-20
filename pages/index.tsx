import { GetStaticProps } from 'next';

import {
  FAQ_REVALIDATE_SECS,
  FAQ_STAKE_PAGE_PATH,
  FAQ_WRAP_AND_UNWRAP_PAGE_PATH,
  FAQ_WITHDRAWALS_PAGE_REQUEST_TAB_PATH,
  FAQ_WITHDRAWALS_PAGE_CLAIM_TAB_PATH,
  dynamics,
} from 'config';
import { StakePage, StakePageProps } from 'features/stake';
import HomePageIpfs, { HomePageIpfsProps } from 'features/ipfs/home-page-ipfs';
import { getFaqSSR } from 'utilsApi/faq';

export default dynamics.ipfsMode ? HomePageIpfs : StakePage;

export const getStaticProps: GetStaticProps<
  StakePageProps | HomePageIpfsProps
> = async () => {
  // FAQ for IPFS SPA
  if (process.env.IPFS_MODE) {
    return {
      props: {
        stakePage: (await getFaqSSR(FAQ_STAKE_PAGE_PATH)) ?? null,
        wrapPage: (await getFaqSSR(FAQ_WRAP_AND_UNWRAP_PAGE_PATH)) ?? null,
        withdrawalsPageRequest:
          (await getFaqSSR(FAQ_WITHDRAWALS_PAGE_REQUEST_TAB_PATH)) ?? null,
        withdrawalsPageClaim:
          (await getFaqSSR(FAQ_WITHDRAWALS_PAGE_CLAIM_TAB_PATH)) ?? null,
      },
    };
  }

  // FAQ for stake page regular
  return {
    props: {
      pageFAQ: (await getFaqSSR(FAQ_STAKE_PAGE_PATH))?.faq ?? null,
    },
    revalidate: FAQ_REVALIDATE_SECS,
  };
};
