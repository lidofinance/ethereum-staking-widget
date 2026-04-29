import { GetStaticPaths } from 'next';
import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';

import { EARN_VAULTS, EarnVaultKey } from 'features/earn/consts';

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

    const vaults = previewData?.manifest?.config.earnVaults ?? [];

    if (!vaults.some((vault) => vault.name === vaultSlug)) {
      return { notFound: true };
    }

    return { props: { vault: vaultSlug } };
  },
);

export default function VaultRedirect({ vault }: PageParams) {
  return (
    <div>
      This route is redirected to the default vault action by Nginx. Requested
      vault: {vault}
    </div>
  );
}
