import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const vaults = ['dvv', 'ggv'] as const;

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: vaults.map((vault) => ({ params: { vault } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const vault = params?.vault as string;

  if (!vaults.includes(vault as (typeof vaults)[number])) {
    return { notFound: true };
  }

  return { props: { vault } };
};

export default function VaultRedirect({ vault }: { vault: string }) {
  const router = useRouter();
  useEffect(() => {
    void router.replace(`/earn/${vault}/deposit`);
  }, [router, vault]);
  return null;
}
