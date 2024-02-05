import {
  FC,
  PropsWithChildren,
  createContext,
  useMemo,
  useContext,
  useReducer,
  Dispatch,
} from 'react';
import { BigNumber } from 'ethers';

import { TX_OPERATION, TX_STAGE, TX_TOKENS } from './types';
import invariant from 'tiny-invariant';

type TransactionModalDispatch = {
  dispatchModalState: Dispatch<TransactionModalAction>;
  dispatchAsyncDialog: (
    type: ModalDialogState['dialog_type'],
  ) => Promise<{ ok: boolean }>;
};

type TransactionModalContextValue = TransactionModalState &
  TransactionModalDispatch;

type ModalDialogState = {
  dialog_type: 'bunker';
  onOk: () => void;
  onClose: (() => void) | null;
};

type TransactionModalState = {
  isModalOpen: boolean;
  txStage: TX_STAGE;
  txOperation: TX_OPERATION;
  dialog: ModalDialogState | null;
  onRetry: (() => void) | null;
  errorText: string | null;
  txHash: string | null;
  amount: BigNumber | null;
  token: TX_TOKENS | null;
};

type TransactionModalAction =
  | {
      type: 'reset';
    }
  | {
      type: 'set_on_retry';
      callback: () => void;
    }
  | {
      type: 'close_modal';
    }
  | {
      type: 'open_modal';
    }
  | ({
      type: 'dialog';
    } & ModalDialogState)
  | {
      type: 'start';
      operation: TX_OPERATION;
      token: TX_TOKENS;
      amount: BigNumber;
    }
  | {
      type: 'signing';
      operation: TX_OPERATION;
    }
  | {
      type: 'block';
      operation?: TX_OPERATION;
      txHash?: string;
    }
  | {
      type: 'error';
      errorText?: string;
    }
  | {
      type: 'success';
      operation?: TX_OPERATION;
    }
  | {
      type: 'success_multisig';
      operation?: TX_OPERATION;
    };

const TransactionModalContext =
  createContext<TransactionModalContextValue | null>(null);
TransactionModalContext.displayName = 'TransactionModalContext';

const TransactionModalReducer = (
  state: TransactionModalState,
  action: TransactionModalAction,
): TransactionModalState => {
  switch (action.type) {
    case 'reset':
      return {
        isModalOpen: false,
        txStage: TX_STAGE.NONE,
        txOperation: TX_OPERATION.NONE,
        errorText: null,
        amount: null,
        token: null,
        txHash: null,
        // keep old restart callback if have one
        onRetry: state.onRetry,
        dialog: null,
      };
    case 'set_on_retry':
      return {
        ...state,
        onRetry: action.callback,
      };
    case 'close_modal':
      return {
        ...state,
        isModalOpen: false,
      };
    case 'open_modal':
      // noop in NONE stage
      if (state.txStage === TX_STAGE.NONE) return state;
      return {
        ...state,
        isModalOpen: true,
      };
    case 'dialog':
      return {
        ...state,
        isModalOpen: true,
        dialog: {
          dialog_type: action.dialog_type,
          onClose: action.onClose,
          onOk: action.onOk,
        },
      };
    case 'start':
      return {
        errorText: null,
        txHash: null,
        dialog: null,
        isModalOpen: true,
        txStage: TX_STAGE.SIGN,
        txOperation: action.operation,
        amount: action.amount,
        token: action.token,
        // keep (re)start callback
        onRetry: state.onRetry,
      };
    case 'signing':
      return {
        ...state,
        isModalOpen: true,
        txStage: TX_STAGE.SIGN,
        txOperation: action.operation ?? state.txOperation,
      };
    case 'block':
      return {
        ...state,
        txOperation: action.operation ?? state.txOperation,
        isModalOpen: true,
        txStage: TX_STAGE.BLOCK,
        txHash: action.txHash ?? null,
      };
    case 'success':
      return {
        ...state,
        isModalOpen: true,
        txOperation: action.operation ?? state.txOperation,
        txStage: TX_STAGE.SUCCESS,
      };
    case 'success_multisig':
      return {
        ...state,
        isModalOpen: true,
        txOperation: action.operation ?? state.txOperation,
        txStage: TX_STAGE.SUCCESS_MULTISIG,
      };
    case 'error':
      return {
        ...state,
        isModalOpen: true,
        errorText: action.errorText ?? null,
        txStage: TX_STAGE.FAIL,
      };
    default:
      throw new Error('unexpected reducer action');
  }
};

const initTxModalState = (): TransactionModalState => ({
  isModalOpen: false,
  txStage: TX_STAGE.NONE,
  txOperation: TX_OPERATION.NONE,
  onRetry: null,
  errorText: null,
  txHash: null,
  amount: null,
  token: null,
  dialog: null,
});

export const useTransactionModalNullable = () => {
  return useContext(TransactionModalContext);
};

export const useTransactionModal = () => {
  const r = useContext(TransactionModalContext);
  invariant(r, 'useTransactionModal was used outside TransactionModalContext');
  return r;
};

export const TransactionModalProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(
    TransactionModalReducer,
    undefined,
    initTxModalState,
  );

  const dispatchValue = useMemo<TransactionModalDispatch>(
    () => ({
      dispatchModalState: dispatch,
      dispatchAsyncDialog: (type) =>
        new Promise((resolve, _) => {
          dispatch({
            type: 'dialog',
            dialog_type: type,
            onOk: () => resolve({ ok: true }),
            onClose: () => resolve({ ok: false }),
          });
        }),
    }),
    [],
  );

  const value = useMemo<TransactionModalContextValue>(
    () => ({
      ...state,
      ...dispatchValue,
    }),
    [state, dispatchValue],
  );
  return (
    <TransactionModalContext.Provider value={value}>
      {children}
    </TransactionModalContext.Provider>
  );
};
