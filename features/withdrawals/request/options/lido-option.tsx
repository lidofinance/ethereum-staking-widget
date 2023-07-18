import Link from 'next/link';
import { Tooltip, Question } from '@lidofinance/lido-ui';

import { useEthAmountByStethWsteth } from 'features/withdrawals/hooks';
import { useRequestForm } from 'features/withdrawals/contexts/request-form-context';

import {
  trackMatomoEvent,
  MATOMO_CLICK_EVENTS_TYPES,
} from 'config/trackMatomoEvent';

import {
  FormatTokenStyled,
  LidoIcon,
  LidoOptionContainer,
  LidoOptionValue,
} from './styles';

const TooltipWithdrawalAmount = () => {
  return (
    <Tooltip
      placement="topRight"
      title={
        <>
          The final amount of claimable ETH can differ
          <br /> For more info, please read{' '}
          <Link href="#amountDifferentFromRequested">
            <a
              aria-hidden="true"
              onClick={() =>
                trackMatomoEvent(
                  MATOMO_CLICK_EVENTS_TYPES.withdrawalFAQtooltipEthAmount,
                )
              }
            >
              FAQ
            </a>
          </Link>
        </>
      }
    >
      <Question />
    </Tooltip>
  );
};

export const LidoOption = () => {
  const { isSteth } = useRequestForm();
  const { inputValue } = useRequestForm();
  const ethAmount = useEthAmountByStethWsteth({ isSteth, input: inputValue });

  return (
    <LidoOptionContainer>
      <LidoIcon />
      Lido
      <LidoOptionValue>
        <FormatTokenStyled showAmountTip amount={ethAmount} symbol="ETH" />{' '}
        <TooltipWithdrawalAmount />
      </LidoOptionValue>
    </LidoOptionContainer>
  );
};
