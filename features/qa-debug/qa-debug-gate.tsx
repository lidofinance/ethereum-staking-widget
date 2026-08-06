import { FC, lazy, Suspense, useCallback, useState } from 'react';

import { config } from 'config';

import { useDebugGesture } from './use-debug-gesture';

// Loaded on first activation only — keeps the drawer out of the entry chunk.
const QaDrawer = lazy(() => import('./qa-drawer/qa-drawer'));

const QaDebugGateInner: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [wasOpened, setWasOpened] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    setWasOpened(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

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
