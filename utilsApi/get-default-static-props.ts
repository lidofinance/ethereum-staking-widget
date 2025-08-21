import type { GetStaticProps, GetStaticPropsResult, Redirect } from 'next';
import type { ParsedUrlQuery } from 'querystring';

import Metrics from 'utilsApi/metrics';
import { fetchExternalManifest } from './fetch-external-manifest';

import { config } from 'config';
import {
  getFallbackedManifestEntry,
  shouldRedirectToRoot,
} from 'config/external-config';

import type {
  Manifest,
  ManifestConfigPage,
  ManifestEntry,
} from 'config/external-config';
import { getBackwardCompatibleConfig } from 'config/external-config/frontend-fallback';

type PreviewData = { manifest: ManifestEntry };

type PrefetchManifestProp = { ___prefetch_manifest___?: object };

export const getDefaultStaticProps = <
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery,
>(
  currentPath: ManifestConfigPage,
  custom?: GetStaticProps<P, Q, PreviewData>,
): GetStaticProps<P & PrefetchManifestProp, Q, PreviewData> => {
  return async (context) => {
    /// common props
    const { ___prefetch_manifest___ } = await fetchExternalManifest();
    const props = ___prefetch_manifest___ ? { ___prefetch_manifest___ } : {};

    const ssrManifest = getFallbackedManifestEntry(
      ___prefetch_manifest___,
      config.defaultChain,
    );
    ssrManifest.config = getBackwardCompatibleConfig(ssrManifest.config);
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
      const { props: customProps, ...rest } = (await custom({
        ...context,
        previewData: {
          manifest: ssrManifest,
        },
      })) as any;
      result = {
        ...rest,
        ...result,
        props: { ...base.props, ...customProps },
      };

      // Fix error: `redirect` and `notFound` can not both be returned from getStaticProps at the same time.
      if ('notFound' in result && 'redirect' in result) {
        delete (result as any).notFound;
      }
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
