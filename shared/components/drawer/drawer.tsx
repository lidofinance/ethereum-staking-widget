import { FC, PropsWithChildren, ReactNode, useEffect } from 'react';
import { Close } from '@lidofinance/lido-ui';

import { useEscape } from 'shared/hooks/useEscape';

import {
  DrawerOverlay,
  DrawerPanel,
  DrawerContent,
  DrawerHeader,
  DrawerCloseButton,
  DrawerFooter,
} from './styles';

export type DrawerProps = PropsWithChildren<{
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  footer?: ReactNode;
  'data-testid'?: string;
}>;

// Right-side drawer (bottom sheet on mobile). Extracted from the earn
// "What is EarnETH Vault" panel — see features/earn/shared/drawer-right.
export const Drawer: FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  footer,
  children,
  'data-testid': testId,
}) => {
  const { handleKeyDown } = useEscape({ onClose });

  // Prevent the page behind the drawer from scrolling while the drawer is open.
  useEffect(() => {
    if (!isOpen) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <DrawerOverlay
      onKeyDown={handleKeyDown}
      onClick={onClose}
      tabIndex={-1}
      isOpen={isOpen}
    >
      <DrawerPanel isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <DrawerContent data-testid={testId}>
          <DrawerHeader>
            <div data-testid="title">{title}</div>
            <DrawerCloseButton
              icon={<Close />}
              size="xxs"
              variant="ghost"
              onClick={onClose}
            />
          </DrawerHeader>
          {children}
          {footer && <DrawerFooter>{footer}</DrawerFooter>}
        </DrawerContent>
      </DrawerPanel>
    </DrawerOverlay>
  );
};
