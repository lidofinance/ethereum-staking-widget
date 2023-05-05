import {
  FC,
  createContext,
  useMemo,
  useContext,
  useReducer,
  Dispatch,
} from 'react';
import { BigNumber } from 'ethers';

import { TX_STAGE } from 'features/withdrawals/shared/tx-stage-modal';
import invariant from 'tiny-invariant';
import type { TokensWithdrawable } from '../types/tokens-withdrawable';

type TransactionModalContextValue = TransactionModalState & {
  dispatchModalState: Dispatch<TransactionModalAction>;
};

type TransactionModalState = {
  isModalOpen: boolean;
  txStage: TX_STAGE;
  startTx: (() => void) | null;
  errorText: string | null;
  txHash: string | null;
  requestAmount: BigNumber | null;
  token: TokensWithdrawable | null;
};

type TransactionModalAction =
  | {
      type: 'reset';
    }
  | {
      type: 'set_starTx_callback';
      callback: () => void;
    }
  | {
      type: 'close_modal';
    }
  | {
      type: 'open_modal';
    }
  | {
      type: 'bunker';
    }
  | {
      type: 'start';
      flow: TX_STAGE.APPROVE | TX_STAGE.PERMIT | TX_STAGE.SIGN;
      token: TokensWithdrawable | null;
      requestAmount: BigNumber;
    }
  | {
      type: 'signing';
    }
  | {
      type: 'block';
      txHash?: string;
    }
  | {
      type: 'error';
      errorText?: string;
    }
  | {
      type: 'success';
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
        errorText: null,
        requestAmount: null,
        token: null,
        txHash: null,
        // keep old (re)start callback if have one
        startTx: state.startTx,
      };
    case 'set_starTx_callback':
      return {
        ...state,
        startTx: action.callback,
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
    case 'bunker':
      invariant(state.startTx, 'state must already have start tx callback');
      return {
        ...state,
        txStage: TX_STAGE.BUNKER,
      };
    case 'start':
      return {
        errorText: null,
        txHash: null,
        txStage: action.flow,
        isModalOpen: true,
        requestAmount: action.requestAmount,
        token: action.token,
        // keep (re)start callback
        startTx: state.startTx,
      };
    case 'signing':
      invariant(state.requestAmount, 'state must already have request amount');
      return {
        ...state,
        isModalOpen: true,
        txStage: TX_STAGE.SIGN,
      };
    case 'block':
      return {
        ...state,
        isModalOpen: true,
        txStage: TX_STAGE.BLOCK,
        txHash: action.txHash ?? null,
      };
    case 'success':
      return {
        ...state,
        txStage: TX_STAGE.SUCCESS,
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
  startTx: null,
  errorText: null,
  txHash: null,
  requestAmount: null,
  token: null,
});

export const useTransactionModal = () => {
  const r = useContext(TransactionModalContext);
  invariant(r, 'useTransactionModal was used outside TransactionModalContext');
  return r;
};

export const TransactionModalProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(
    TransactionModalReducer,
    undefined,
    initTxModalState,
  );
  const value = useMemo(
    () => ({
      ...state,
      dispatchModalState: dispatch,
    }),
    [state],
  );
  return (
    <TransactionModalContext.Provider value={value}>
      {children}
    </TransactionModalContext.Provider>
  );
};
