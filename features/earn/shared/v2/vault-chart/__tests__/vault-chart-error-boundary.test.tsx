import type { ReactElement } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { VaultChartErrorBoundary } from '../vault-chart-error-boundary';

// No DOM runs in unit tests, so the boundary is checked by its element:
// a catching boundary with an empty fallback around the given chart
describe('VaultChartErrorBoundary', () => {
  const chart = <div>chart</div>;
  const boundary = VaultChartErrorBoundary({
    children: chart,
  }) as ReactElement<{
    fallback: unknown;
    children: unknown;
    onError: (error: unknown) => void;
  }>;

  it('catches errors of the chart with an error boundary', () => {
    expect(boundary.type).toBe(ErrorBoundary);
    expect(boundary.props.children).toBe(chart);
  });

  it('renders nothing in place of a failed chart', () => {
    expect(boundary.props.fallback).toBe(null);
  });

  it('turns a render error into boundary state', () => {
    const state = ErrorBoundary.getDerivedStateFromError(
      new RangeError('Invalid time value'),
    );
    expect(state.didCatch).toBe(true);
  });

  it('logs a caught error with its scope', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    boundary.props.onError(new RangeError('Invalid time value'));

    expect(warn).toHaveBeenCalledWith(
      '[VaultChartErrorBoundary] RangeError: Invalid time value',
    );
    warn.mockRestore();
  });
});
