import type { GetStaticProps, GetStaticPropsResult, PreviewData } from 'next';
import type { ParsedUrlQuery } from 'querystring';

import Metrics from 'utilsApi/metrics';
import { fetchExternalManifest } from './fetch-external-manifest';
import { config } from 'config';

export const getDefaultStaticProps = <
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData,
>(
  custom?: GetStaticProps<P, Q, D>,
): GetStaticProps<P & { ___prefetch_manifest___?: object }, Q, D> => {
  return async (context) => {
    /// common props
    const { ___prefetch_manifest___ } = await fetchExternalManifest();
    const props = ___prefetch_manifest___ ? { ___prefetch_manifest___ } : {};
    const base = {
      props,
      // because next only remembers first value, default to short revalidation period
      revalidate: config.DEFAULT_REVALIDATION,
    };

    /// custom getStaticProps
    let result = base as GetStaticPropsResult<P>;
    if (custom) {
      const { props: customProps, ...rest } = (await custom(context)) as any;
      result = {
        ...base,
        ...rest,
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
