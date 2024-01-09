import { formatEther, parseEther } from '@ethersproject/units';

import { useWaitingTime } from 'features/withdrawals/hooks/useWaitingTime';
import { useWithdrawalRates } from 'features/withdrawals/hooks/useWithdrawalRates';
import { useWstethToStethRatio } from 'shared/components/data-table-row-steth-by-wsteth';

import { formatBalance } from 'utils/formatBalance';

import {
  InlineLoaderSmall,
  LidoIcon,
  OptionsPickerButton,
  OptionsPickerContainer,
  OptionsPickerIcons,
  OptionsPickerLabel,
  OptionsPickerRow,
  OptionsPickerSubLabel,
  OpenOceanIcon,
} from './styles';
import {
  trackMatomoEvent,
  MATOMO_CLICK_EVENTS_TYPES,
} from 'config/trackMatomoEvent';
import { useWatch } from 'react-hook-form';
import { RequestFormInputType } from 'features/withdrawals/request/request-form-context';
import { TOKENS } from '@lido-sdk/constants';

type OptionButtonProps = {
  onClick: React.ComponentProps<'button'>['onClick'];
  isActive?: boolean;
};

const DEFAULT_VALUE_FOR_RATE = parseEther('1');

const LidoButton: React.FC<OptionButtonProps> = ({ isActive, onClick }) => {
  const [amount, token] = useWatch<RequestFormInputType, ['amount', 'token']>({
    name: ['amount', 'token'],
  });
  const isSteth = token === TOKENS.STETH;
  const { value: waitingTime, initialLoading } = useWaitingTime(
    amount ? formatEther(amount) : '',
    {
      isApproximate: true,
    },
  );
  const { wstethAsStethBN, loading } = useWstethToStethRatio();
  const ratioLoading = !isSteth && loading;
  const ratio = isSteth ? '1 : 1' : `1 : ${formatBalance(wstethAsStethBN)}`;

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
      <OptionsPickerRow data-testid="lidoOptionRate">
        <OptionsPickerSubLabel>Rate:</OptionsPickerSubLabel>
        {ratioLoading ? <InlineLoaderSmall /> : ratio}
      </OptionsPickerRow>
      <OptionsPickerRow data-testid="lidoOptionWaitingTime">
        <OptionsPickerSubLabel>Waiting time:</OptionsPickerSubLabel>
        {initialLoading ? <InlineLoaderSmall /> : waitingTime}
      </OptionsPickerRow>
    </OptionsPickerButton>
  );
};

const DexButton: React.FC<OptionButtonProps> = ({ isActive, onClick }) => {
  const { loading, bestRate } = useWithdrawalRates({
    fallbackValue: DEFAULT_VALUE_FOR_RATE,
  });
  const bestRateValue = bestRate ? `1 : ${bestRate.toFixed(4)}` : '-';
  return (
    <OptionsPickerButton
      data-testid="dexOptions"
      type="button"
      $active={isActive}
      onClick={onClick}
    >
      <OptionsPickerRow>
        <OptionsPickerLabel>Use aggregators</OptionsPickerLabel>
        <OptionsPickerIcons>
          <OpenOceanIcon />
        </OptionsPickerIcons>
      </OptionsPickerRow>
      <OptionsPickerRow data-testid="dexBestRate">
        <OptionsPickerSubLabel>Best Rate:</OptionsPickerSubLabel>
        {loading ? <InlineLoaderSmall /> : bestRateValue}
      </OptionsPickerRow>
      <OptionsPickerRow data-testid="dexWaitingTime">
        <OptionsPickerSubLabel>Waiting time:</OptionsPickerSubLabel>~&nbsp;1-5
        minutes
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
