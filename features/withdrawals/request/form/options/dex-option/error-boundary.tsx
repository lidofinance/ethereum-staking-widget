import dynamic from 'next/dynamic';
import { ErrorBoundary } from 'react-error-boundary';
import { FallbackContainer } from './styles';

// @cowprotocol/widget-lib accesses `document` at module scope,
// so the entire CowSwap widget tree must be loaded client-side only.
const DexOption = dynamic(() => import('./dex-option').then((m) => m.DexOption), {
  ssr: false,
});

const Fallback = () => {
  return (
    <FallbackContainer>
      <h2>DEX temporarily unavailable</h2>
      <span>
        This feature relies on an external provider that is currently not
        responding. Please refresh the page or try again later.
      </span>
    </FallbackContainer>
  );
};

export const DexOptionWithErrorBoundary = () => {
  return (
    <ErrorBoundary FallbackComponent={Fallback}>
      <DexOption />
    </ErrorBoundary>
  );
};
