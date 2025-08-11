import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import Head from 'next/head';
import { Layout } from 'shared/components';
import {
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_DVV_SLUG,
  EARN_VAULT_GGV_SLUG,
  EARN_VAULT_WITHDRAW_SLUG,
} from 'consts/urls';
import { VaultPageDVV } from 'features/earn/vault-dvv/vault-page-dvv';
import { VaultPageGGV } from 'features/earn/vault-ggv/vault-page-ggv';

export default function VaultActionPage({
  vault,
  action,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout>
      <Head>
        <title>{`${vault.toUpperCase()} ${action} | Earn | Lido`}</title>
        <meta
          name="description"
          content={`${vault.toUpperCase()} vault ${action} on Lido`}
        />
      </Head>

      {vault === EARN_VAULT_DVV_SLUG && <VaultPageDVV action={action} />}
      {vault === EARN_VAULT_GGV_SLUG && <VaultPageGGV action={action} />}
    </Layout>
  );
}

const actionsByVault: Record<string, string[]> = {
  [EARN_VAULT_GGV_SLUG]: [EARN_VAULT_DEPOSIT_SLUG, EARN_VAULT_WITHDRAW_SLUG],
  [EARN_VAULT_DVV_SLUG]: [EARN_VAULT_DEPOSIT_SLUG, EARN_VAULT_WITHDRAW_SLUG],
};

type PageParams = {
  vault: typeof EARN_VAULT_DVV_SLUG | typeof EARN_VAULT_GGV_SLUG;
  action: typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths: { params: { vault: string; action: string } }[] = [];
  Object.entries(actionsByVault).forEach(([vault, actions]) => {
    actions.forEach((action) => {
      paths.push({ params: { vault, action } });
    });
  });

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<PageParams> = async ({
  params,
}) => {
  const vault = params?.vault as string;
  const action = params?.action as string;

  if (!actionsByVault[vault] || !actionsByVault[vault].includes(action)) {
    return { notFound: true };
  }

  return {
    props: {
      vault: vault as PageParams['vault'],
      action: action as PageParams['action'],
    },
  };
};
