/**
 * A modal session as the modal provider hands it out
 */
export type TxModalSession<P> = {
  modalSession: string;
  updateProps: (props: P) => void;
  closeModal: () => void;
};

/**
 * The one modal slot of the app, as a run sees it
 */
export type TxModalSlot<P> = {
  openModal: (props: P) => TxModalSession<P>;
  // the session on screen now, null when no modal is open
  getOpenSession: () => string | null;
};

/**
 * One run of a transaction flow, as the modal sees it. Every stage the run
 * shows goes to the modal session the run opened; the modal is one for the
 * whole app, so a run that is no longer the latest one must not take it from
 * the run that is.
 */
export type TxModalRun<P> = {
  // whether the run has shown a stage yet
  readonly isStarted: boolean;
  // Shows a stage and returns its session; undefined when a newer modal owns it.
  show: (slot: TxModalSlot<P>, props: P) => TxModalSession<P> | undefined;
};

// The run that started last, across every flow on the page
let latestRun: unknown = null;

/**
 * Creates a run. Its first stage always opens the modal: a run starts on a
 * user action, and from then on it is the latest run. Each later stage:
 * - updates the run's own session while that session is on screen;
 * - opens a new session when no modal is open (the user closed the run's
 *   modal and the outcome arrived later) or when the run is still the latest;
 * - is dropped otherwise: another modal is on screen, opened by a newer run
 *   or by the user. The outcome of the older run is not lost: the data it
 *   changed is refetched, and the wallet keeps the transaction.
 */
export const createTxModalRun = <P>(): TxModalRun<P> => {
  let session: TxModalSession<P> | null = null;

  const run: TxModalRun<P> = {
    get isStarted() {
      return session !== null;
    },
    show: (slot, props) => {
      const openSession = slot.getOpenSession();
      if (session && session.modalSession === openSession) {
        session.updateProps(props);
        return session;
      }
      if (session && latestRun !== run && openSession !== null) {
        return undefined;
      }
      if (!session) latestRun = run;
      session = slot.openModal(props);
      return session;
    },
  };

  return run;
};
