import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';

interface DynamicOptions {
  ssr?: boolean;
  loading?: () => ReactNode;
}

/**
 * Shim for `next/dynamic`. There is no SSR at runtime, so `ssr: false`
 * collapses to the same behavior as `ssr: true` — both yield a client-side
 * `React.lazy` boundary. The `loading` prop becomes the Suspense fallback.
 *
 * For the `no-ssr-wrapper` pattern in this codebase (`dynamic(() =>
 * Promise.resolve(Component), { ssr: false })`), the lazy load resolves
 * synchronously after a tick — equivalent to the Next behavior in a SPA.
 */
export default function dynamic<P>(
  importer: () => Promise<{ default: ComponentType<P> } | ComponentType<P>>,
  opts: DynamicOptions = {},
): ComponentType<P> {
  const Lazy = lazy(async () => {
    const mod = await importer();
    if (typeof mod === 'function') {
      return { default: mod };
    }
    return mod;
  });
  const fallback = opts.loading ? opts.loading() : null;

  const LazyAny = Lazy as ComponentType<any>;
  const Wrapped: ComponentType<P> = (props) => (
    <Suspense fallback={fallback}>
      <LazyAny {...props} />
    </Suspense>
  );
  Wrapped.displayName = 'NextDynamicShim';
  return Wrapped;
}
