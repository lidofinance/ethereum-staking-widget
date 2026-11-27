import {
  createContext,
  forwardRef,
  useContext,
  type PropsWithChildren,
} from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

// undefined: no Layout above, null: the slot is not mounted yet
export const FabSlotContext = createContext<HTMLElement | null | undefined>(
  undefined,
);

// No box of its own: the sticky Fab uses the full-width page root, not the Main container.
const FabSlotStyle = styled.div`
  display: contents;
`;

export const FabSlot = forwardRef<HTMLDivElement>((_, ref) => (
  <FabSlotStyle ref={ref} />
));
FabSlot.displayName = 'FabSlot';

// lido-app-ui Fab must be between Main and Footer to stay at the screen edge.
export const FabPortal = ({ children }: PropsWithChildren) => {
  const slot = useContext(FabSlotContext);

  // Without Layout (e.g. in unit tests), render in place.
  if (slot === undefined) return <>{children}</>;
  if (slot === null) return null;
  return createPortal(children, slot);
};
