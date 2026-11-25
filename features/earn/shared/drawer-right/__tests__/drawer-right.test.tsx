import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ThemeProvider, themeLight } from '@lidofinance/lido-ui';

import { DRAWER_WIDTH } from '../styles';
import { DrawerRight } from '../drawer-right';

type StubProps = {
  open: boolean;
  onClose: () => void;
  width: number;
  title: ReactNode;
  labels: { close: string };
  dataTestId: { title: string };
  children: ReactNode;
  'data-testid': string;
};

const state = vi.hoisted(() => ({ calls: [] as unknown[] }));

vi.mock('../drawer-table', () => ({ DrawerTable: () => null }));
vi.mock('config', () => ({ config: { helpOrigin: 'https://help.test' } }));
// in-app links of app-ui reach LocalLink through the Earn link provider
vi.mock('shared/components/local-link', () => ({
  LocalLink: ({
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>,
}));

// jsdom is not available and the library Drawer renders nothing on the server,
// so only the Drawer is stubbed; DrawerRight and the other parts are real
vi.mock('@lidofinance/lido-app-ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@lidofinance/lido-app-ui')>()),
  Drawer: forwardRef<HTMLDivElement, StubProps>((props, ref) => {
    state.calls.push(props);
    if (!props.open) return null;
    return (
      <div ref={ref} data-testid={props['data-testid']}>
        <span data-testid={props.dataTestId.title}>{props.title}</span>
        {props.children}
      </div>
    );
  }),
}));

const render = (props: { isOpen: boolean; hideUpgrade?: boolean }) => {
  const onClose = vi.fn();
  const html = renderToStaticMarkup(
    <ThemeProvider theme={themeLight}>
      <DrawerRight
        isOpen={props.isOpen}
        onClose={onClose}
        shouldHideUpgradeNowButton={props.hideUpgrade}
      />
    </ThemeProvider>,
  );
  return { html, onClose, drawerProps: state.calls.at(-1) as StubProps };
};

describe('DrawerRight', () => {
  it('renders the panel, title and description when open', () => {
    const { html } = render({ isOpen: true });
    expect(html).toContain('data-testid="earn-side-panel"');
    expect(html).toContain('data-testid="title"');
    expect(html).toContain('What is EarnETH Vault and how it works');
    expect(html).toContain('data-testid="description"');
    expect(html).toContain('data-testid="get-in-touch-button"');
  });

  it('renders no content when closed', () => {
    const { html, drawerProps } = render({ isOpen: false });
    expect(html).not.toContain('earn-side-panel');
    expect(drawerProps.open).toBe(false);
  });

  it('passes width and the close label to the library drawer', () => {
    const { drawerProps } = render({ isOpen: true });
    expect(drawerProps.width).toBe(DRAWER_WIDTH);
    expect(drawerProps.labels).toEqual({ close: 'Close' });
  });

  it('calls onClose when the library drawer requests close', () => {
    const { drawerProps, onClose } = render({ isOpen: true });
    drawerProps.onClose();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows the upgrade button unless hidden', () => {
    expect(render({ isOpen: true }).html).toContain(
      'data-testid="upgrade-now-button"',
    );
    expect(render({ isOpen: true, hideUpgrade: true }).html).not.toContain(
      'data-testid="upgrade-now-button"',
    );
  });
});
