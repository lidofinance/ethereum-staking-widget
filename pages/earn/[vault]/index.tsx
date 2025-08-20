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

    if (
      !previewData?.manifest?.config.earnVaults.find(
        (vault) => vault.name === vaultSlug,
      )
    ) {
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
