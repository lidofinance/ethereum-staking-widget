import type { GetStaticProps, GetStaticPropsResult, PreviewData } from 'next';
import type { ParsedUrlQuery } from 'querystring';

import Metrics from 'utilsApi/metrics';
import { fetchExternalManifest } from './fetch-external-manifest';

export const getDefaultStaticProps = <
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData,
>(
  custom?: GetStaticProps<P, Q, D>,
): GetStaticProps<P & { ___prefetch_manifest___?: object }, Q, D> => {
  let shouldZeroRevalidate = true;
  return async (context) => {
    /// common props
    const { ___prefetch_manifest___, revalidate } =
      await fetchExternalManifest();
    const props = ___prefetch_manifest___ ? { ___prefetch_manifest___ } : {};
    const base = {
      props,
      revalidate: shouldZeroRevalidate ? 1 : revalidate,
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
      `[getDefaultStaticProps] running revalidation, next revalidation in ${base.revalidate}`,
    );
    Metrics.request.ssrCounter.labels({ revalidate: base.revalidate }).inc(1);

    shouldZeroRevalidate = false;
    return result;
  };
};
