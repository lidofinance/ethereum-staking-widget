import { ErrorBoundary } from 'react-error-boundary';
import { DexOption } from './dex-option';
import { FallbackContainer } from './styles';

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
