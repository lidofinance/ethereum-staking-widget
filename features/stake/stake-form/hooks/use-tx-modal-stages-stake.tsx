import type { Address } from 'viem';
import { Button, Link } from '@lidofinance/lido-ui';
import { trackEvent } from '@lidofinance/analytics-matomo';

import { MATOMO_CLICK_EVENTS } from 'consts/matomo-click-events';

import { LINK_EXPLORE_STRATEGIES } from 'shared/banners/vaults-banner-info/const';
import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import { VaultsBannerInfo } from 'shared/banners/vaults-banner-info';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { TxStageOperationSucceedBalanceShown } from 'shared/transaction-modal/tx-stages-composed/tx-stage-operation-succeed-balance-shown';

const STAGE_OPERATION_ARGS = {
  token: 'ETH',
  willReceiveToken: 'stETH',
  operationText: 'Staking',
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

  pending: (amount: bigint, txHash?: Address) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        willReceive={amount}
        isPending
        txHash={txHash}
      />,
    ),

  success: (balance: bigint, txHash?: Address) =>
    transitStage(
      <TxStageOperationSucceedBalanceShown
        txHash={txHash}
        balance={balance}
        balanceToken={'stETH'}
        operationText={'Staking'}
        footer={
          <>
            <VaultsBannerInfo isTitleCompact showLearnMoreButton={false} />
            <br />
            <Link
              href={LINK_EXPLORE_STRATEGIES}
              onClick={() =>
                trackEvent(
                  ...MATOMO_CLICK_EVENTS.exploreAllStrategiesAfterStake,
                )
              }
            >
              <Button fullwidth size="sm">
                Explore strategies
              </Button>
            </Link>
          </>
        }
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesStake = () => {
  return useTransactionModalStage(getTxModalStagesStake);
};
