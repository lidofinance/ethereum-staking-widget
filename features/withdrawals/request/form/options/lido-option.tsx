import { useEthAmountByStethWsteth } from 'features/withdrawals/hooks';

import {
  trackMatomoEvent,
  MATOMO_CLICK_EVENTS_TYPES,
} from 'config/trackMatomoEvent';
import { Tooltip, Question } from '@lidofinance/lido-ui';

import {
  FormatTokenStyled,
  LidoIcon,
  LidoOptionContainer,
  LidoOptionValue,
} from './styles';
import { LocalLink } from 'shared/components/local-link';
import { useWatch } from 'react-hook-form';
import { RequestFormInputType } from 'features/withdrawals/request/request-form-context';
import { TOKENS } from '@lido-sdk/constants';
import { formatEther } from '@ethersproject/units';

const TooltipWithdrawalAmount = () => {
  return (
    <Tooltip
      placement="topRight"
      title={
        <>
          The final amount of claimable ETH can differ
          <br /> For more info, please read{' '}
          <LocalLink href="#amountDifferentFromRequested">
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
          </LocalLink>
        </>
      }
    >
      <Question />
    </Tooltip>
  );
};

export const LidoOption = () => {
  const [token, amount] = useWatch<RequestFormInputType, ['token', 'amount']>({
    name: ['token', 'amount'],
  });

  // TODO: refactor to use intermediate validation values
  const ethAmount = useEthAmountByStethWsteth({
    isSteth: token === TOKENS.STETH,
    input: amount ? formatEther(amount) : undefined,
  });

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
