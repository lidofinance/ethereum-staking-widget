import type {
  TransactionModalAction,
  TransactionModalContent,
  TransactionModalType,
} from './types';

export type TransactionModalView = TransactionModalContent & {
  type: TransactionModalType;
};

export type TransactionModalState = {
  open: boolean;
  /** kept on close, so the modal does not empty while it animates out */
  view: TransactionModalView | null;
};

export type TransactionModalReducerAction =
  TransactionModalAction | ({ type: 'prompt' } & TransactionModalContent);

export const initialTransactionModalState: TransactionModalState = {
  open: false,
  view: null,
};

export const transactionModalReducer = (
  state: TransactionModalState,
  action: TransactionModalReducerAction,
): TransactionModalState =>
  action.type === 'close'
    ? { ...state, open: false }
    : { open: true, view: action };
