import type { ReactNode } from 'react';

export type TransactionStage = 'loading' | 'success' | 'error';

/** what the modal shows: a stage, or `prompt` (an async modal awaiting an answer) */
export type TransactionModalType = TransactionStage | 'prompt';

export type TransactionModalContent = {
  title?: ReactNode;
  subTitle?: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
  /** the closing action, e.g. <TransactionLink /> or <TryAgainButton /> */
  bottomCTA?: ReactNode;
};

export type TransactionModalAction =
  { type: 'close' } | ({ type: TransactionStage } & TransactionModalContent);

export type AsyncModalArgs<TResult> = Omit<TransactionModalContent, 'extra'> & {
  /** renders the answer controls; `resolve` settles the dispatchAsyncModal promise */
  extraButton: (resolve: (result: TResult) => void) => ReactNode;
};

export type TransactionStageModalContextValue = {
  isOpen: boolean;
  /** the last shown, kept after close; null before the first dispatch */
  type: TransactionModalType | null;
  /** shows a stage (or closes); replaces whatever the modal shows */
  dispatchTransactionModal: (action: TransactionModalAction) => void;
  /**
   * Asks the user: resolves with what `extraButton` passes to `resolve`,
   * or `null` when the modal is closed or replaced first. Never rejects.
   */
  dispatchAsyncModal: <TResult>(
    args: AsyncModalArgs<TResult>,
  ) => Promise<TResult | null>;
};
