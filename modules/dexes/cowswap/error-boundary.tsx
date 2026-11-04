import { ErrorBoundary } from 'react-error-boundary';
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

export const DexOptionErrorBoundary = ({
  children,
}: React.PropsWithChildren) => {
  return <ErrorBoundary FallbackComponent={Fallback}>{children}</ErrorBoundary>;
};
