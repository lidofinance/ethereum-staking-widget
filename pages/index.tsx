import { GetStaticProps } from 'next';
import { config } from 'config';
import { StakePage } from 'features/stake';
import { HomePageIpfs } from 'features/ipfs';

export default config.ipfsMode ? HomePageIpfs : StakePage;

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
    revalidate: 60,
  };
};
