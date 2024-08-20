import { Button, Link } from '@lidofinance/lido-ui';
import { trackEvent } from '@lidofinance/analytics-matomo';

import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';

import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { TxStageOperationSucceedBalanceShown } from 'shared/transaction-modal/tx-stages-composed/tx-stage-operation-succeed-balance-shown';
import { LINK_EXPLORE_STRATEGIES } from 'shared/banners/vaults-banner-info/const';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import type { BigNumber } from 'ethers';
import type { TokensWrappable } from 'features/wsteth/shared/types';
import { VaultsBannerInfo } from 'shared/banners/vaults-banner-info';

import { MATOMO_CLICK_EVENTS } from 'consts/matomo-click-events';

const STAGE_APPROVE_ARGS = {
  willReceiveToken: 'wstETH',
  operationText: 'Unlocking',
};

const STAGE_OPERATION_ARGS = {
  willReceiveToken: 'wstETH',
  operationText: 'Wrapping',
};

const getTxModalStagesWrap = (transitStage: TransactionModalTransitStage) => ({
  ...getGeneralTransactionModalStages(transitStage),

  signApproval: (amount: BigNumber, token: TokensWrappable) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_APPROVE_ARGS}
        amount={amount}
        token={getTokenDisplayName(token)}
      />,
    ),

  pendingApproval: (
    amount: BigNumber,
    token: TokensWrappable,
    txHash?: string,
  ) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_APPROVE_ARGS}
        amount={amount}
        token={getTokenDisplayName(token)}
        isPending
        txHash={txHash}
      />,
    ),

  sign: (amount: BigNumber, token: TokensWrappable, willReceive: BigNumber) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        token={getTokenDisplayName(token)}
        willReceive={willReceive}
      />,
    ),

  pending: (
    amount: BigNumber,
    token: TokensWrappable,
    willReceive: BigNumber,
    txHash?: string,
  ) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        token={getTokenDisplayName(token)}
        willReceive={willReceive}
        isPending
        txHash={txHash}
      />,
    ),

  success: (balance: BigNumber, txHash?: string) =>
    transitStage(
      <TxStageOperationSucceedBalanceShown
        txHash={txHash}
        balance={balance}
        balanceToken={'wstETH'}
        operationText={'Wrapping'}
        footer={
          <>
            <VaultsBannerInfo isTitleCompact showLearnMoreButton={false} />
            <br />
            <Link
              href={LINK_EXPLORE_STRATEGIES}
              onClick={() =>
                trackEvent(...MATOMO_CLICK_EVENTS.exploreAllStrategiesAfterWrap)
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

export const useTxModalWrap = () => {
  return useTransactionModalStage(getTxModalStagesWrap);
};
