import { useTransactionModalStage } from 'shared/transaction-modal/hooks/use-transaction-modal-stage';

export type TxModalStages = ReturnType<
  typeof useTransactionModalStage
>['txModalStages'];
