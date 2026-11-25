import { renderToStaticMarkup } from 'react-dom/server';

const lifecycle = vi.hoisted(() => ({ cleanups: [] as (() => void)[] }));
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useEffect: (setup: () => void | (() => void)) => {
      const cleanup = setup();
      if (cleanup) lifecycle.cleanups.push(cleanup);
    },
  };
});

import {
  ModalProvider,
  useModalActions,
  type ModalContextValue,
} from './modal-provider';

const FirstModal = () => null;
const SecondModal = () => null;

// The provider's actions; its state updates are no-ops in a server render,
// the open session is tracked outside of it
const renderActions = () => {
  let actions: ModalContextValue | undefined;
  const Probe = () => {
    actions = useModalActions();
    return null;
  };
  renderToStaticMarkup(
    <ModalProvider>
      <Probe />
    </ModalProvider>,
  );
  return actions as ModalContextValue;
};

describe('ModalProvider open session', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    lifecycle.cleanups = [];
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('is the session opened last until it closes', () => {
    const { openModal, getOpenSession } = renderActions();

    expect(getOpenSession()).toBeNull();

    const first = openModal(FirstModal, {});
    expect(getOpenSession()).toBe(first.modalSession);

    const second = openModal(SecondModal, {});
    expect(getOpenSession()).toBe(second.modalSession);

    // a replaced session cannot close the one that replaced it
    first.closeModal();
    vi.runAllTimers();
    expect(getOpenSession()).toBe(second.modalSession);

    second.closeModal();
    vi.runAllTimers();
    expect(getOpenSession()).toBeNull();
  });

  it('closes by type only the modal of that type', () => {
    const { openModal, closeModal, getOpenSession } = renderActions();
    const first = openModal(FirstModal, {});

    closeModal(SecondModal);
    vi.runAllTimers();
    expect(getOpenSession()).toBe(first.modalSession);

    closeModal(FirstModal);
    vi.runAllTimers();
    expect(getOpenSession()).toBeNull();
  });

  it('does not close a modal opened after the close was asked', () => {
    const { openModal, closeModal, getOpenSession } = renderActions();
    openModal(FirstModal, {});

    closeModal();
    const second = openModal(FirstModal, {});
    vi.runAllTimers();

    expect(getOpenSession()).toBe(second.modalSession);
  });

  it('resolves a waiting dialog when its session is closed', async () => {
    const { openModal } = renderActions();
    let finish!: (result: boolean) => void;
    const result = new Promise<boolean>((resolve) => {
      finish = resolve;
    });
    const session = openModal<{ onDismiss?: () => void }>(FirstModal, {
      onDismiss: () => finish(false),
    });
    session.closeModal();
    vi.runAllTimers();
    await expect(result).resolves.toBe(false);
  });

  it('cancels a replaced dialog without closing its replacement', async () => {
    const { openModal, getOpenSession } = renderActions();
    let finish!: (result: boolean) => void;
    const result = new Promise<boolean>((resolve) => {
      finish = resolve;
    });
    const previous = openModal(FirstModal, { onDismiss: () => finish(false) });
    const next = openModal(SecondModal, {});
    await expect(result).resolves.toBe(false);
    previous.closeModal();
    vi.runAllTimers();
    expect(getOpenSession()).toBe(next.modalSession);
  });

  it('cancels a dialog when another stage replaces it in the same session', async () => {
    const { openModal } = renderActions();
    let finish!: (result: boolean) => void;
    const result = new Promise<boolean>((resolve) => {
      finish = resolve;
    });
    const session = openModal<{ onDismiss?: () => void }>(FirstModal, {
      onDismiss: () => finish(false),
    });
    session.updateProps({});
    await expect(result).resolves.toBe(false);
  });

  it('cancels a waiting dialog when its provider unmounts', async () => {
    const { openModal, getOpenSession } = renderActions();
    let finish!: (result: boolean) => void;
    const result = new Promise<boolean>((resolve) => {
      finish = resolve;
    });
    openModal(FirstModal, { onDismiss: () => finish(false) });
    lifecycle.cleanups.forEach((cleanup) => cleanup());
    await expect(result).resolves.toBe(false);
    expect(getOpenSession()).toBeNull();
  });
});
