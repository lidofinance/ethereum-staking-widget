import { CowswapFrame } from './cowswap-frame';
import { DexOptionErrorBoundary } from './error-boundary';

export const CowswapDex = () => {
  return (
    <DexOptionErrorBoundary>
      <CowswapFrame />
    </DexOptionErrorBoundary>
  );
};
