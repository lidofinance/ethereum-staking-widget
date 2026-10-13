import { FC, lazy, Suspense, useCallback, useState } from 'react';

import { config } from 'config';

import { useDebugGesture } from './use-debug-gesture';

// Loaded on first activation only — keeps the drawer out of the entry chunk.
const QaDrawer = lazy(() => import('./qa-drawer/qa-drawer'));

const QaDebugGateInner: FC = () => {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const wasOpened = isOpen !== null;

  useDebugGesture(open);

  if (!wasOpened) return null;

  return (
    <Suspense fallback={null}>
      <QaDrawer isOpen={isOpen} onClose={close} />
    </Suspense>
  );
};

export const QaDebugGate: FC = () =>
  config.enableQaHelpers ? <QaDebugGateInner /> : null;
