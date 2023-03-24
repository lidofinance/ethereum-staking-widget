import {
  FC,
  RefObject,
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BigNumber } from 'ethers';

import { TxRequestModal } from 'features/withdrawals/request/tx-modal';
import { TX_STAGE } from 'features/withdrawals/shared/tx-stage-modal';

export const RequestTxModalContext = createContext({} as RequestTxModalValue);

export type RequestTxModalValue = {
  txModalOpen: boolean;
  setTxModalOpen: (value: boolean) => void;
  txStage?: TX_STAGE;
  setTxStage: (value?: TX_STAGE) => void;
  txHash?: string;
  setTxHash: (value?: string) => void;
  txModalFailedText: string;
  setTxModalFailedText: (value: string) => void;
  openTxModal: () => void;
  closeTxModal: () => void;
  requestAmount?: BigNumber;
  setRequestAmount: (value: BigNumber) => void;
  formRef: RefObject<HTMLFormElement>;
  tokenName: string;
  setTokenName: (value: string) => void;
  setCallback: (value: () => void) => void;
  callback?: () => void;
};

const RequestTxModalProvider: FC = ({ children }) => {
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStage, setTxStage] = useState<TX_STAGE>();
  const [txHash, setTxHash] = useState<string>();
  const [txModalFailedText, setTxModalFailedText] = useState('');
  const [requestAmount, setRequestAmount] = useState<BigNumber>();
  const [tokenName, setTokenName] = useState<string>('');
  const [callback, setCallback] = useState<() => void>();
  const formRef = useRef<HTMLFormElement>(null);

  const reset = useCallback(() => {
    setTxHash(undefined);
    setTxStage(undefined);
    setTxModalFailedText('');
  }, []);

  const openTxModal = useCallback(() => {
    setTxModalOpen(true);
  }, []);

  const closeTxModal = useCallback(() => {
    setTxModalOpen(false);
    reset();
  }, [reset]);

  const value = useMemo(
    () => ({
      txModalOpen,
      setTxModalOpen,
      txStage,
      setTxStage,
      txHash,
      setTxHash,
      txModalFailedText,
      setTxModalFailedText,
      openTxModal,
      closeTxModal,
      requestAmount,
      setRequestAmount,
      reset,
      formRef,
      tokenName,
      setTokenName,
      setCallback,
      callback,
    }),
    [
      txModalOpen,
      txStage,
      txHash,
      txModalFailedText,
      openTxModal,
      closeTxModal,
      requestAmount,
      reset,
      tokenName,
      callback,
    ],
  );

  return (
    <RequestTxModalContext.Provider value={value}>
      {children}
      <TxRequestModal />
    </RequestTxModalContext.Provider>
  );
};

export default RequestTxModalProvider;
