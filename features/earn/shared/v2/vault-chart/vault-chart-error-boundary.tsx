import type { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

type VaultChartErrorBoundaryProps = { children: ReactNode };

const logChartError = (error: unknown) =>
  console.warn(`[VaultChartErrorBoundary] ${error}`);

// A chart failure hides only the chart, the vault forms stay mounted
export const VaultChartErrorBoundary = ({
  children,
}: VaultChartErrorBoundaryProps) => (
  <ErrorBoundary fallback={null} onError={logChartError}>
    {children}
  </ErrorBoundary>
);
