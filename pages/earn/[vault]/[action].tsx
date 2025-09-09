import { GetStaticPaths } from 'next';
import Head from 'next/head';
import { Layout } from 'shared/components';
import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';

import { VaultPageDVV, VaultPageGGV, VaultPageSTG } from 'features/earn';

import {
  type EarnVaultKey,
  EARN_VAULTS,
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_WITHDRAW_SLUG,
} from 'features/earn/consts';

type PageParams = {
  vault: EarnVaultKey;
  action: typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;
};

const VAULT_PAGES = {
  ggv: VaultPageGGV,
  dvv: VaultPageDVV,
  stg: VaultPageSTG,
} as const;

export const getStaticPaths: GetStaticPaths = async () => {
  const paths: { params: { vault: string; action: string } }[] = [];
  EARN_VAULTS.forEach((vault) => {
    paths.push(
      { params: { vault, action: EARN_VAULT_DEPOSIT_SLUG } },
      { params: { vault, action: EARN_VAULT_WITHDRAW_SLUG } },
    );
  });
  return { paths, fallback: false };
};

export const getStaticProps = getDefaultStaticProps<PageParams, PageParams>(
  '/earn',
  async ({ params, previewData }) => {
    const vault = params?.vault;
    const action = params?.action;

    let vaults = previewData?.manifest?.config.earnVaults ?? [];

    /* *********************************************************************
     *  !!! IMPORTANT TODO (REMOVE WHEN STG IS ADDED TO CONFIG) !!!        *
     *                                                                     *
     *  This temporary entry forces the 'stg' vault into the UI while the *
     *  official config does not yet include it.                           *
     *                                                                     *
     *  ACTION REQUIRED:
     *    - Remove the following manual insertion (vaults = [{ name: 'stg' }, ...vaults];)
     *      as soon as the 'stg' vault is present in previewData.manifest.config.earnVaults
     ********************************************************************* */
    vaults = [{ name: 'stg' }, ...vaults];

    // if vault is disabled by config
    // or action is not valid
    // 404
    if (
      !vaults.some((v) => v.name === vault) ||
      (action != EARN_VAULT_DEPOSIT_SLUG && action != EARN_VAULT_WITHDRAW_SLUG)
    ) {
      return { notFound: true };
    }

    return {
      props: {
        vault: vault as PageParams['vault'],
        action: action,
      },
    };
  },
);

export default function VaultActionPage({ vault, action }: PageParams) {
  const VaultPage = VAULT_PAGES[vault];
  const vaultTitle = vault.toUpperCase();
  return (
    <Layout>
      <Head>
        <title>{`${vaultTitle} ${action} | Earn | Lido`}</title>
        <meta
          name="description"
          content={`${vaultTitle} vault ${action} on Lido`}
        />
      </Head>

      <VaultPage action={action} />
    </Layout>
  );
}
