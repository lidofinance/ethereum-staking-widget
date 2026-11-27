import { useRef, type ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { Drawer, Fab, IconQuestion, downQuery } from '@lidofinance/lido-app-ui';

import { FabPortal } from 'shared/components/layout/fab-slot';
import { devicesHeaderMedia } from 'styles/global';

const DRAWER_WIDTH = 500;

// The Fab gives its className to the button, so the offsets apply to the button only
const PositionedFab = styled(Fab)<{ $raiseBy?: string }>`
  translate: 0
    calc(-1 * (var(--earn-fab-nav-offset, 0px) + var(--earn-fab-raise, 0px)));

  // Keep the button above the mobile navigation of the app.
  @media ${devicesHeaderMedia.mobile} {
    --earn-fab-nav-offset: var(--nav-mobile-height);
  }

  // The floating bar shows only on tablets and phones.
  ${({ $raiseBy }) =>
    $raiseBy &&
    css`
      @media ${downQuery('lg')} {
        --earn-fab-raise: ${$raiseBy};
      }
    `}
`;

type FaqDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  // CSS length that lifts the button, e.g. to the middle of a floating bar
  raiseBy?: string;
};

// floating help button with the FAQ, as in the library FAQ drawer recipe
export const FaqDrawer = ({
  open,
  onOpenChange,
  children,
  raiseBy,
}: FaqDrawerProps) => {
  // Safari does not focus a clicked button, so give the drawer a target
  const fabRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <FabPortal>
        <PositionedFab
          ref={fabRef}
          icon={<IconQuestion />}
          aria-label="Frequently asked questions"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => onOpenChange(true)}
          $raiseBy={raiseBy}
          data-testid="earn-faq-button"
        />
      </FabPortal>
      <Drawer
        open={open}
        onClose={() => onOpenChange(false)}
        title="FAQ"
        width={DRAWER_WIDTH}
        returnFocusTo={fabRef}
        labels={{ close: 'Close' }}
        dataTestId={{ root: 'earn-faq-drawer' }}
      >
        <div>{children}</div>
      </Drawer>
    </>
  );
};
