import type {
  GetStaticProps,
  GetStaticPropsResult,
  PreviewData,
  Redirect,
} from 'next';
import type { ParsedUrlQuery } from 'querystring';

import Metrics from 'utilsApi/metrics';
import { fetchExternalManifest } from './fetch-external-manifest';
import type { Manifest, ManifestConfigPage } from 'config/external-config';
import { config } from 'config';
import { shouldRedirectToRoot } from 'config/external-config';

export const getDefaultStaticProps = <
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData,
>(
  currentPath: ManifestConfigPage,
  custom?: GetStaticProps<P, Q, D>,
): GetStaticProps<P & { ___prefetch_manifest___?: object }, Q, D> => {
  return async (context) => {
    /// common props
    const { ___prefetch_manifest___ } = await fetchExternalManifest();
    const props = ___prefetch_manifest___ ? { ___prefetch_manifest___ } : {};
    const base: GetStaticPropsResult<typeof props> = {
      props,
      // because next only remembers first value, default to short revalidation period
      revalidate: config.DEFAULT_REVALIDATION,
    };
    let result = base as GetStaticPropsResult<P>;

    if (
      shouldRedirectToRoot(
        currentPath,
        ___prefetch_manifest___ as Manifest | null,
      )
    ) {
      result = {
        ...base,
        redirect: { destination: '/', permanent: false } as Redirect,
      };
    }

    /// custom getStaticProps
    if (custom) {
      const { props: customProps, ...rest } = (await custom(context)) as any;
      result = {
        ...rest,
        ...result,
        props: { ...base.props, ...customProps },
      };
    }

    /// metrics
    console.debug(
      `[getDefaultStaticProps] running revalidation, next revalidation in ${result.revalidate}`,
    );
    Metrics.request.ssrCounter
      .labels({ revalidate: String(result.revalidate) })
      .inc(1);

    return result;
  };
};
