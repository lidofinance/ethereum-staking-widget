import type { GetStaticProps, PreviewData } from 'next';
import type { ParsedUrlQuery } from 'querystring';
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
    const { ___prefetch_manifest___, revalidate } =
      await fetchExternalManifest();
    const props = ___prefetch_manifest___ ? { ___prefetch_manifest___ } : {};
    const base = {
      props,
      revalidate: shouldZeroRevalidate ? 1 : revalidate,
    };
    if (custom) {
      const { props: customProps, ...rest } = (await custom(context)) as any;
      return {
        ...base,
        ...rest,
        props: { ...base.props, ...customProps },
      };
    }
    shouldZeroRevalidate = false;
    return base;
  };
};
