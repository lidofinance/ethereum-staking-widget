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

import { TxRequestModal } from 'features/withdrawals/claim/tx-modal';
import { TX_STAGE } from 'features/withdrawals/shared/tx-stage-modal';

export const ClaimTxModalContext = createContext({} as ClaimTxModalValue);

export type ClaimTxModalValue = {
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
  buttonRef: RefObject<HTMLButtonElement>;
};

const ClaimTxModalProvider: FC = ({ children }) => {
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStage, setTxStage] = useState<TX_STAGE>();
  const [txHash, setTxHash] = useState<string>();
  const [txModalFailedText, setTxModalFailedText] = useState('');
  const [requestAmount, setRequestAmount] = useState<BigNumber>();
  const buttonRef = useRef<HTMLButtonElement>(null);

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
      buttonRef,
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
    ],
  );

  return (
    <ClaimTxModalContext.Provider value={value}>
      {children}
      <TxRequestModal />
    </ClaimTxModalContext.Provider>
  );
};

export default ClaimTxModalProvider;
