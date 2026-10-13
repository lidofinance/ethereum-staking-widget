/**
 * Minimal hand-written declarations for the two @lidofinance packages the
 * SERVER imports at RUNTIME. Their published exports maps don't expose
 * types under `moduleResolution: bundler`, and the tsconfig-`paths`
 * workaround used for browser-only packages (lido-ui, analytics-matomo)
 * cannot be used here: tsx resolves `paths` at runtime and would try to
 * execute the .d.ts file (see server/tsconfig.json).
 *
 * Shapes cover exactly what src/logger.ts and src/metrics/index.ts use.
 */
declare module '@lidofinance/satanizer' {
  export const commonPatterns: Array<string | RegExp>;
  export const satanizer: (
    patterns: Array<string | RegExp | undefined | null | false>,
  ) => <T>(data: T) => T;
}

declare module '@lidofinance/api-metrics' {
  import type { Registry } from 'prom-client';

  export const collectStartupMetrics: (options: {
    prefix: string;
    registry: Registry;
    defaultChain: string;
    supportedChains: string[];
    version: string;
    commit: string;
    branch: string;
  }) => void;

  export const getStatusLabel: (status: number) => string;
}
