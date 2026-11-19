import { renderToStaticMarkup } from 'react-dom/server';
import {
  ModalProvider,
  useModalActions,
  type ModalComponentType,
  type ModalContextValue,
} from './modal-provider';

// Keep the provider's state and ref across server renders so the actual modal
// receives its close prop. No DOM, animation or timer other than its own close.
const renderer = vi.hoisted(
  (): {
    state: unknown;
    ref: { current: unknown } | null;
    close: (() => void) | undefined;
  } => ({ state: null, ref: null, close: undefined }),
);
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useState: (initial: unknown) => {
      const [value, setValue] = actual.useState(initial);
      return [
        renderer.state ?? value,
        (next: unknown) => {
          renderer.state =
            typeof next === 'function' ? next(renderer.state) : next;
          setValue(next);
        },
      ];
    },
    useRef: (initial: unknown) => {
      const ref = actual.useRef(initial);
      renderer.ref ??= ref;
      return renderer.ref;
    },
  };
});

const Dialog: ModalComponentType = ({ onClose }) => {
  renderer.close = onClose;
  return null;
};
const render = () => {
  let actions!: ModalContextValue;
  const Probe = () => {
    actions = useModalActions();
    return null;
  };
  renderToStaticMarkup(
    <ModalProvider>
      <Probe />
    </ModalProvider>,
  );
  return actions;
};

it('an old modal X/backdrop handler cannot dismiss its replacement', () => {
  vi.useFakeTimers();
  try {
    const actions = render();
    actions.openModal(Dialog, {});
    render();
    const oldClose = renderer.close;
    expect(oldClose).toBeTypeOf('function');
    const next = actions.openModal(Dialog, {});
    oldClose?.();
    vi.runAllTimers();
    expect(actions.getOpenSession()).toBe(next.modalSession);
  } finally {
    vi.useRealTimers();
  }
});
