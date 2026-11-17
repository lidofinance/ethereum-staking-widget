import type { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

type VaultChartErrorBoundaryProps = { children: ReactNode };

// A chart failure hides only the chart, the vault forms stay mounted
export const VaultChartErrorBoundary = ({
  children,
}: VaultChartErrorBoundaryProps) => (
  <ErrorBoundary fallback={null}>{children}</ErrorBoundary>
);
