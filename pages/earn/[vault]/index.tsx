import { GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { EARN_PATH } from 'consts/urls';
import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';

import {
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULTS,
  EarnVaultKey,
} from 'features/earn/consts';

type PageParams = {
  vault: EarnVaultKey;
};

export const getStaticPaths: GetStaticPaths<PageParams> = async () => {
  return {
    paths: EARN_VAULTS.map((vault) => ({ params: { vault } })),
    fallback: false,
  };
};

export const getStaticProps = getDefaultStaticProps(
  '/earn',
  async ({ params, previewData }) => {
    const vaultSlug = params?.vault;

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

    if (!vaults.some((vault) => vault.name === vaultSlug)) {
      return { notFound: true };
    }

    return { props: { vault: vaultSlug } };
  },
);

export default function VaultRedirect({ vault }: PageParams) {
  const router = useRouter();
  useEffect(() => {
    void router.replace(`${EARN_PATH}/${vault}/${EARN_VAULT_DEPOSIT_SLUG}`);
  }, [router, vault]);
  return null;
}
