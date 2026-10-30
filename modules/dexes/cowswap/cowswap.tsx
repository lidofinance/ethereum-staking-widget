import { CowswapFrame, CowswapFrameProps } from './cowswap-frame';
import { DexOptionErrorBoundary } from './error-boundary';

export const CowswapDex: React.FC<CowswapFrameProps> = (props) => {
  return (
    <DexOptionErrorBoundary>
      <CowswapFrame {...props} />
    </DexOptionErrorBoundary>
  );
};
