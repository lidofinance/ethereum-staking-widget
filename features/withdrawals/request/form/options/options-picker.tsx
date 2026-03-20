import { useWatch } from 'react-hook-form';
import { Tooltip } from '@lidofinance/lido-ui';

import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';

import { useWaitingTime } from 'features/withdrawals/hooks/useWaitingTime';

import { RequestFormInputType } from 'features/withdrawals/request/request-form-context';

import { trackMatomoEvent } from 'utils/track-matomo-event';

import {
  InlineLoaderSmall,
  LidoIcon,
  OptionsPickerButton,
  OptionsPickerContainer,
  OptionsPickerIcons,
  OptionsPickerLabel,
  OptionsPickerRow,
  OptionsPickerSubLabel,
  InlineQuestion,
  CowSwapIcon,
} from './styles';

type OptionButtonProps = {
  onClick: React.ComponentProps<'button'>['onClick'];
  isActive?: boolean;
};

const LidoButton: React.FC<OptionButtonProps> = ({ isActive, onClick }) => {
  const [amount] = useWatch<RequestFormInputType, ['amount']>({
    name: ['amount'],
  });
  const { isCongested } = useWaitingTime(null);
  const { value: waitingTime, isLoading: isWaitingTimeLoading } =
    useWaitingTime(amount, {
      isApproximate: true,
    });

  return (
    <OptionsPickerButton
      data-testid="lidoOption"
      type="button"
      $active={isActive}
      onClick={onClick}
    >
      <OptionsPickerRow>
        <OptionsPickerLabel>Use Lido</OptionsPickerLabel>
        <OptionsPickerIcons>
          <LidoIcon />
        </OptionsPickerIcons>
      </OptionsPickerRow>
      <OptionsPickerRow data-testid="lidoOptionWaitingTime">
        <OptionsPickerSubLabel>
          Waiting time:&nbsp;
          {isCongested && (
            <Tooltip title="Due to increased ecosystem activity, Ethereum’s validator exit queue is currently longer than usual. As a result, Lido withdrawals can take additional time to be processed.">
              <InlineQuestion />
            </Tooltip>
          )}
        </OptionsPickerSubLabel>
        {isWaitingTimeLoading ? <InlineLoaderSmall /> : waitingTime}
      </OptionsPickerRow>
    </OptionsPickerButton>
  );
};

const DexButton: React.FC<OptionButtonProps> = ({ isActive, onClick }) => {
  return (
    <OptionsPickerButton
      data-testid="dexOptions"
      type="button"
      $active={isActive}
      onClick={onClick}
    >
      <OptionsPickerRow>
        <OptionsPickerLabel>Use DEX</OptionsPickerLabel>
        <OptionsPickerIcons>
          <CowSwapIcon />
        </OptionsPickerIcons>
      </OptionsPickerRow>
      <OptionsPickerRow data-testid="dexWaitingTime">
        <OptionsPickerSubLabel>Waiting time:</OptionsPickerSubLabel>{' '}
        <>~&nbsp;30 seconds</>
      </OptionsPickerRow>
    </OptionsPickerButton>
  );
};

type OptionsPickerProps = {
  selectedOption: 'lido' | 'dex';
  onOptionSelect?: (value: 'lido' | 'dex') => void;
};

export const OptionsPicker: React.FC<OptionsPickerProps> = ({
  onOptionSelect,
  selectedOption,
}) => {
  return (
    <OptionsPickerContainer>
      <LidoButton
        isActive={selectedOption === 'lido'}
        data-testid="lidoOption"
        onClick={(e) => {
          e.preventDefault();
          trackMatomoEvent(MATOMO_CLICK_EVENTS_TYPES.withdrawalUseLido);
          onOptionSelect?.('lido');
        }}
      />
      <DexButton
        isActive={selectedOption === 'dex'}
        onClick={(e) => {
          e.preventDefault();
          trackMatomoEvent(MATOMO_CLICK_EVENTS_TYPES.withdrawalUseAggregators);
          onOptionSelect?.('dex');
        }}
      />
    </OptionsPickerContainer>
  );
};
