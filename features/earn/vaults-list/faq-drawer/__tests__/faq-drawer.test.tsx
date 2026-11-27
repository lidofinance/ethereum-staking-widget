import { forwardRef, type ReactNode, type RefObject } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { VaultsListFaqDrawer } from '../faq-drawer';
import { EARN_LIST_FAQ } from '../faq-items';

type DrawerStubProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  width: number;
  returnFocusTo: RefObject<HTMLElement | null>;
  children: ReactNode;
};

const state = vi.hoisted(() => ({
  drawer: undefined as DrawerStubProps | undefined,
}));

// the answers have their own links and config; only the questions matter here.
// No JSX: the factory is hoisted above the JSX runtime import.
vi.mock('../faq-items', () => ({
  EARN_LIST_FAQ: [
    { id: 'first', question: 'First question?', answer: 'First answer' },
    { id: 'second', question: 'Second question?', answer: 'Second answer' },
  ],
}));

// the library Drawer renders nothing on the server, so it always renders here
vi.mock('@lidofinance/lido-app-ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@lidofinance/lido-app-ui')>()),
  Drawer: forwardRef<HTMLDivElement, DrawerStubProps>((props, ref) => {
    state.drawer = props;
    return (
      <div ref={ref} data-testid="drawer" data-open={props.open}>
        {props.title}
        {props.children}
      </div>
    );
  }),
}));

describe('VaultsListFaqDrawer', () => {
  it('renders the help button, closed by default', () => {
    const html = renderToStaticMarkup(<VaultsListFaqDrawer />);
    expect(html).toContain('data-testid="earn-faq-button"');
    expect(html).toContain('aria-label="Frequently asked questions"');
    expect(html).toContain('aria-expanded="false"');
    expect(state.drawer?.open).toBe(false);
  });

  it('passes the title, width and focus target to the drawer', () => {
    renderToStaticMarkup(<VaultsListFaqDrawer />);
    const drawer = state.drawer;
    expect(drawer?.title).toBe('FAQ');
    expect(drawer?.width).toBe(500);
    expect(drawer?.returnFocusTo).toHaveProperty('current');
  });

  it('lists every question and opens only the first one', () => {
    const html = renderToStaticMarkup(<VaultsListFaqDrawer />);
    EARN_LIST_FAQ.forEach(({ question }) => expect(html).toContain(question));
    expect(html.match(/aria-expanded="true"/g)).toHaveLength(1);
    expect(html).toContain('First answer');
  });
});
