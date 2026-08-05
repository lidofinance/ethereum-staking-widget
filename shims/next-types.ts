/**
 * Type-only shim for `import type { GetStaticProps, ... } from 'next'`.
 * Resolved via Vite alias / tsconfig paths for the bare `next` specifier.
 *
 * Nothing in the SPA ever CALLS `getStaticProps` / `getStaticPaths` — the
 * exports are dead code kept only where a file has not been ported yet.
 * New code must not import from `next`.
 */

export type GetStaticPathsResult<
  Params = Record<string, string | string[] | undefined>,
> = {
  paths: Array<{ params: Params } | string>;
  fallback: boolean | 'blocking';
};

export type GetStaticPaths<
  Params = Record<string, string | string[] | undefined>,
> = () => Promise<GetStaticPathsResult<Params>> | GetStaticPathsResult<Params>;

export type GetStaticPropsContext<
  Params = Record<string, string | string[] | undefined>,
> = {
  params?: Params;
  preview?: boolean;
  previewData?: {
    manifest?: { config?: { earnVaults?: Array<{ name: string }> } };
  };
  locale?: string;
  locales?: string[];
  defaultLocale?: string;
};

export type GetStaticPropsResult<Props> =
  | { props: Props; revalidate?: number | boolean }
  | { notFound: true; revalidate?: number | boolean }
  | { redirect: { destination: string; permanent: boolean } };

export type GetStaticProps<
  Props = Record<string, unknown>,
  Params = Record<string, string | string[] | undefined>,
> = (
  ctx: GetStaticPropsContext<Params>,
) => Promise<GetStaticPropsResult<Props>>;

export type NextPage<P = Record<string, unknown>, IP = P> = React.FC<P> & {
  getInitialProps?: (ctx: unknown) => Promise<IP>;
};
