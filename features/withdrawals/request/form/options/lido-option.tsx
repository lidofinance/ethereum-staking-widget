import { useWatch } from 'react-hook-form';
import { formatEther } from '@ethersproject/units';

import { Tooltip, Question } from '@lidofinance/lido-ui';
import { TOKENS } from '@lido-sdk/constants';

import { useEthAmountByStethWsteth } from 'features/withdrawals/hooks';
import { useInpageNavigation } from 'providers/inpage-navigation';
import { RequestFormInputType } from 'features/withdrawals/request/request-form-context';

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
  const { navigateInpageAnchor } = useInpageNavigation();

  return (
    <Tooltip
      placement="topRight"
      title={
        <>
          The final amount of claimable ETH can differ
          <br /> For more info, please read{' '}
          <a
            data-testid="lidoOptionToolTipFAQ"
            href="#amountDifferentFromRequested"
            onClick={(e) => {
              trackMatomoEvent(
                MATOMO_CLICK_EVENTS_TYPES.withdrawalFAQtooltipEthAmount,
              );
              navigateInpageAnchor(e);
            }}
          >
            FAQ
          </a>
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
    <LidoOptionContainer data-testid="lidoOptionSection">
      <LidoIcon />
      Lido
      <LidoOptionValue data-testid="lidoOptionAmount">
        <FormatTokenStyled
          data-testid="lidoOptionAmount"
          amount={ethAmount}
          symbol="ETH"
        />{' '}
        <TooltipWithdrawalAmount />
      </LidoOptionValue>
    </LidoOptionContainer>
  );
};
