import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import {
  EARN_PATH,
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_DVV_SLUG,
  EARN_VAULT_GGV_SLUG,
} from 'consts/urls';
import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';

const vaults = [EARN_VAULT_DVV_SLUG, EARN_VAULT_GGV_SLUG] as const;

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: vaults.map((vault) => ({ params: { vault } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = getDefaultStaticProps(
  '/earn',
  async ({ params }) => {
    const vault = params?.vault as string;

    if (!vaults.includes(vault as (typeof vaults)[number])) {
      return { notFound: true };
    }

    return { props: { vault } };
  },
);

export default function VaultRedirect({ vault }: { vault: string }) {
  const router = useRouter();
  useEffect(() => {
    void router.replace(`${EARN_PATH}/${vault}/${EARN_VAULT_DEPOSIT_SLUG}`);
  }, [router, vault]);
  return null;
}
