import type { ReactElement, ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { modalContext, type ModalContextValue } from 'providers/modal-provider';
import {
  TxSentDataUnavailableError,
  TxSettledError,
  TxStaleError,
} from 'modules/web3/utils/errors';

import { getGeneralTransactionModalStages } from '../get-general-transaction-modal-stages';
import {
  useTransactionModalStage,
  type TransactionModalTransitStage,
} from '../use-transaction-modal-stage';

// the hook's own state, replaceable to follow the run it keeps there
const hookState = vi.hoisted(() => ({
  useState: undefined as undefined | ((init: () => unknown) => unknown),
  effects: [] as (() => void | (() => void))[],
}));
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useState: (init: () => unknown) =>
      (hookState.useState ?? actual.useState)(init),
    useEffect: (effect: () => void | (() => void)) => {
      hookState.effects.push(effect);
    },
  };
});
vi.mock('modules/web3', async () => ({
  ...(await import('modules/web3/utils/errors')),
  useDappStatus: () => ({ isDappActive: true }),
}));
vi.mock('utils', async () => {
  const errors = await import('modules/web3/utils/errors');
  return {
    getErrorMessage: (error: Error) => error.message,
    isSettledTxError: (error: unknown) =>
      error instanceof errors.TxSettledError,
    isRetryableTxError: (error: unknown) =>
      !(error instanceof errors.TxSettledError) &&
      !(error instanceof errors.TxSentDataUnavailableError),
  };
});
vi.mock('shared/transaction-modal/tx-stages-basic', () => ({
  TxStageFail: () => null,
  TxStageSuccessMultisig: () => null,
}));
vi.mock('../../transaction-modal', async () => {
  const { useModal } = await import('providers/modal-provider');
  const TransactionModal = () => null;
  return {
    TransactionModal,
    useTransactionModal: () => useModal(TransactionModal),
  };
});

type StageProps = { name: string; label?: string };
const Stage = (_: StageProps) => null;

const getStages = (transitStage: TransactionModalTransitStage) => ({
  ...getGeneralTransactionModalStages(transitStage),
  sign: (label: string) => transitStage(<Stage name="sign" label={label} />),
  pending: (label: string) =>
    transitStage(<Stage name="pending" label={label} />),
  success: (label: string) =>
    transitStage(<Stage name="success" label={label} />, {
      isClosableOnLedger: true,
    }),
});

type ShownModal = {
  modalSession: string;
  props: { children?: ReactNode };
};

// The provider's contract with the stage hook, without React state: one
// modal on screen, session-bound updates and closes
const createModalSlot = () => {
  let shown: ShownModal | null = null;
  let count = 0;
  const openModal = vi.fn((_modal: unknown, props: ShownModal['props']) => {
    const modalSession = `session-${++count}`;
    shown = { modalSession, props };
    return {
      modalSession,
      updateProps: (nextProps: ShownModal['props']) => {
        if (shown?.modalSession === modalSession) {
          shown = { modalSession, props: nextProps };
        }
      },
      closeModal: () => {
        if (shown?.modalSession === modalSession) shown = null;
      },
    };
  });
  const value = {
    openModal,
    closeModal: () => {
      shown = null;
    },
    getOpenSession: () => shown?.modalSession ?? null,
  } as unknown as ModalContextValue;

  return {
    value,
    openModal,
    // what the modal shows now
    shown: () => shown?.props.children as ReactElement | undefined,
    // the user closes the modal, or opens another one
    closeByUser: () => {
      shown = null;
    },
    openOther: () => {
      shown = { modalSession: `other-${++count}`, props: {} };
    },
  };
};

type ModalSlot = ReturnType<typeof createModalSlot>;

// One submit of a flow: the stages the hook hands out for one run. A later
// submit gets the stages of the next render, which carry a new run
const startRun = (slot: ModalSlot) => {
  let stages: ReturnType<typeof getStages> | undefined;
  const Probe = () => {
    stages = useTransactionModalStage(getStages).txModalStages;
    return null;
  };
  renderToStaticMarkup(
    <modalContext.Provider value={slot.value}>
      <Probe />
    </modalContext.Provider>,
  );
  return stages as ReturnType<typeof getStages>;
};

const describeShown = (slot: ModalSlot) => {
  const element = slot.shown();
  if (!element) return null;
  const props = element.props as StageProps & { onRetry?: unknown };
  return {
    name: props.name ?? (element.type as { name: string }).name,
    label: props.label,
    onRetry: props.onRetry,
  };
};

describe('useTransactionModalStage', () => {
  beforeEach(() => {
    hookState.effects = [];
  });

  it('keeps showing stages after React replays the mount effect', () => {
    const slot = createModalSlot();
    const run = startRun(slot);
    const setup = hookState.effects[0];
    const cleanup = setup();
    cleanup?.();
    setup();

    run.sign('after replay');

    expect(describeShown(slot)).toMatchObject({
      name: 'sign',
      label: 'after replay',
    });
  });

  it('moves the current run through its stages in one modal session', () => {
    const slot = createModalSlot();
    const run = startRun(slot);

    run.sign('a');
    run.pending('a');
    run.success('a');

    expect(slot.openModal).toHaveBeenCalledTimes(1);
    expect(describeShown(slot)).toMatchObject({ name: 'success', label: 'a' });
  });

  it('shows the current run failing, with a retry', () => {
    const slot = createModalSlot();
    const onRetry = vi.fn();
    const run = startRun(slot);

    run.sign('a');
    run.failed(new Error('reverted'), onRetry);

    expect(describeShown(slot)).toMatchObject({ name: 'TxStageFail', onRetry });
  });

  it('keeps a newer run on screen when an older run succeeds', () => {
    const slot = createModalSlot();
    const older = startRun(slot);
    const newer = startRun(slot);

    older.sign('older');
    older.pending('older');
    slot.closeByUser();
    newer.sign('newer');
    older.success('older');

    expect(describeShown(slot)).toMatchObject({ name: 'sign', label: 'newer' });
  });

  it.each([
    ['fails', new Error('reverted')],
    ['settles and a read fails', new TxSettledError(new Error('read'))],
    ['is sent and never read back', new TxSentDataUnavailableError('x')],
  ])('keeps a newer run on screen when an older run %s', (_, error) => {
    const slot = createModalSlot();
    const older = startRun(slot);
    const newer = startRun(slot);

    older.sign('older');
    newer.sign('newer');
    older.failed(error, vi.fn());

    expect(describeShown(slot)).toMatchObject({ name: 'sign', label: 'newer' });
  });

  it('shows an older run outcome when no modal is open, then yields to the newer run', () => {
    const slot = createModalSlot();
    const older = startRun(slot);
    const newer = startRun(slot);

    older.sign('older');
    slot.closeByUser();
    newer.sign('newer');
    slot.closeByUser();
    older.failed(new TxSettledError(new Error('read')));

    expect(describeShown(slot)).toMatchObject({ name: 'TxStageFail' });

    newer.success('newer');

    expect(describeShown(slot)).toMatchObject({
      name: 'success',
      label: 'newer',
    });
  });

  it('lets the current run succeed and fail after an older run', () => {
    const slot = createModalSlot();
    const older = startRun(slot);
    older.sign('older');
    older.success('older');

    const current = startRun(slot);
    current.sign('current');
    current.pending('current');
    current.success('current');
    expect(describeShown(slot)).toMatchObject({
      name: 'success',
      label: 'current',
    });

    const failing = startRun(slot);
    failing.sign('failing');
    failing.failed(new Error('reverted'));
    expect(describeShown(slot)).toMatchObject({ name: 'TxStageFail' });
  });

  it('keeps a newer run on screen when an older run reaches the multisig', () => {
    const slot = createModalSlot();
    const older = startRun(slot);
    const newer = startRun(slot);

    older.sign('older');
    newer.sign('newer');
    older.successMultisig();

    expect(describeShown(slot)).toMatchObject({ name: 'sign', label: 'newer' });

    newer.successMultisig();

    expect(describeShown(slot)).toMatchObject({
      name: 'TxStageSuccessMultisig',
    });
  });

  it('never brings back the retry of an older run over a newer one', () => {
    const slot = createModalSlot();
    const onOlderRetry = vi.fn();
    const older = startRun(slot);
    older.sign('older');
    older.failed(new Error('reverted'), onOlderRetry);

    // the retry starts a new run: it takes the modal from the failed one
    const newer = startRun(slot);
    newer.sign('newer');
    older.failed(new Error('reverted again'), onOlderRetry);

    expect(describeShown(slot)).toMatchObject({
      name: 'sign',
      label: 'newer',
      onRetry: undefined,
    });

    newer.success('newer');

    expect(describeShown(slot)).toMatchObject({
      name: 'success',
      label: 'newer',
    });
    expect(onOlderRetry).not.toHaveBeenCalled();
  });

  it('does not replace a modal the user opened with an older run stage', () => {
    const slot = createModalSlot();
    const older = startRun(slot);
    const newer = startRun(slot);

    older.sign('older');
    newer.sign('newer');
    slot.openOther();
    older.success('older');

    expect(slot.shown()).toBeUndefined();
  });

  it('shows nothing for a run superseded before the wallet', () => {
    const slot = createModalSlot();
    const run = startRun(slot);

    run.failed(new TxStaleError());

    expect(slot.openModal).not.toHaveBeenCalled();
  });

  it('hands the next submit of the same form a run of its own', () => {
    const slot = createModalSlot();
    // the run the hook keeps in state, and what it puts there next
    let nextRun: unknown;
    hookState.useState = (init) => [
      nextRun ?? init(),
      (value: unknown) => {
        nextRun = value;
      },
    ];

    try {
      const older = startRun(slot);
      older.sign('older');
      const started = nextRun;
      older.pending('older');
      // only the first stage of a run asks for the next one
      expect(nextRun).toBe(started);
      expect(started).toBeDefined();

      slot.closeByUser();
      // the next render of the same form: its stages carry the new run
      const newer = startRun(slot);
      newer.sign('newer');
      older.success('older');

      expect(describeShown(slot)).toMatchObject({
        name: 'sign',
        label: 'newer',
      });
    } finally {
      hookState.useState = undefined;
    }
  });
});
