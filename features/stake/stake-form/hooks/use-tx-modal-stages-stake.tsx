import type { Hash } from 'viem';
import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { TxStageOperationSucceedBalanceShown } from 'shared/transaction-modal/tx-stages-composed/tx-stage-operation-succeed-balance-shown';
import { useConfig } from 'config';
import { EarnUpToBanner } from 'shared/banners/earn-up-to-banner';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';
import { WhaleBanner, useWhaleBanner } from 'features/whale-banners';

const STAGE_OPERATION_ARGS = {
  token: 'ETH',
  willReceiveToken: 'stETH',
  operationText: 'Staking',
};

const SuccessFooter = ({ stethBalance }: { stethBalance: bigint }) => {
  const { featureFlags } = useConfig().externalConfig;
  const whaleBannerConfig = useWhaleBanner(stethBalance);
  return (
    <>
      <EarnUpToBanner
        matomoEvent={MATOMO_CLICK_EVENTS_TYPES.startEarning}
        placement="afterStake"
      />
      {featureFlags.whaleBannerEnabled && whaleBannerConfig && (
        <WhaleBanner config={whaleBannerConfig} />
      )}
    </>
  );
};

const getTxModalStagesStake = (transitStage: TransactionModalTransitStage) => ({
  ...getGeneralTransactionModalStages(transitStage),

  sign: (amount: bigint) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        willReceive={amount}
      />,
    ),

  pending: (amount: bigint, txHash?: Hash, isAA?: boolean) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        isAA={isAA}
        willReceive={amount}
        isPending
        txHash={txHash}
      />,
    ),

  success: (balance: bigint, txHash?: Hash) =>
    transitStage(
      <TxStageOperationSucceedBalanceShown
        txHash={txHash}
        balance={balance}
        balanceToken={'stETH'}
        operationText={'Staking'}
        footer={<SuccessFooter stethBalance={balance} />}
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesStake = () => {
  return useTransactionModalStage(getTxModalStagesStake);
};
