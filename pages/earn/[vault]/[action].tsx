import { VaultPageDVV } from 'features/earn/vault-page-dvv/vault-page-dvv';
import { VaultPageGGV } from 'features/earn/vault-page-ggv/vault-page-ggv';
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import Head from 'next/head';
import { Layout } from 'shared/components';

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

      {vault === 'dvv' && <VaultPageDVV action={action} />}
      {vault === 'ggv' && <VaultPageGGV action={action} />}
    </Layout>
  );
}

const actionsByVault: Record<string, string[]> = {
  dvv: ['deposit', 'withdraw'],
  ggv: ['deposit', 'withdraw'],
};

type PageParams = {
  vault: 'dvv' | 'ggv';
  action: 'deposit' | 'withdraw';
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
