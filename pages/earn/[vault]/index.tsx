import { GetStaticPaths, GetStaticProps } from 'next';

const vaults = ['dvv', 'ggv'] as const;

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: vaults.map((vault) => ({ params: { vault } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const vault = params?.vault as string;
  // Redirect base /earn/{vault} to deposit
  return {
    redirect: {
      destination: `/earn/${vault}/deposit`,
      permanent: false,
    },
  };
};

export default function VaultRedirect() {
  return null;
}
