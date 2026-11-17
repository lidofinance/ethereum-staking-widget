import { renderToStaticMarkup } from 'react-dom/server';

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
});
