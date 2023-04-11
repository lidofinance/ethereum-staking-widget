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

type RequestTxModalContextValue = RequestTxModalState & {
  dispatchModalState: Dispatch<RequestTxModalAction>;
};

type RequestTxModalState = {
  isModalOpen: boolean;
  txStage: TX_STAGE;
  startTx: (() => void) | null;
  errorText: string | null;
  txHash: string | null;
  requestAmount: BigNumber | null;
  tokenName: string | null;
};

type RequestTxModalAction =
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
      type: 'bunker';
    }
  | {
      type: 'start';
      flow: TX_STAGE.APPROVE | TX_STAGE.PERMIT | TX_STAGE.SIGN;
      tokenName: string | null;
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

const RequestTxModalContext = createContext<RequestTxModalContextValue | null>(
  null,
);
RequestTxModalContext.displayName = 'RequestTxModalContext';

const txModalReducer = (
  state: RequestTxModalState,
  action: RequestTxModalAction,
): RequestTxModalState => {
  switch (action.type) {
    case 'reset':
      return {
        isModalOpen: false,
        txStage: TX_STAGE.NONE,
        errorText: null,
        requestAmount: null,
        tokenName: null,
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
        tokenName: action.tokenName,
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

const initTxModalState = (): RequestTxModalState => ({
  isModalOpen: false,
  txStage: TX_STAGE.NONE,
  startTx: null,
  errorText: null,
  txHash: null,
  requestAmount: null,
  tokenName: null,
});

export const useTransactionModal = () => {
  const r = useContext(RequestTxModalContext);
  invariant(r, 'useRequestTxModal was used outside RequestTxModalContext');
  return r;
};

export const TransactionModalProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(
    txModalReducer,
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
    <RequestTxModalContext.Provider value={value}>
      {children}
    </RequestTxModalContext.Provider>
  );
};
