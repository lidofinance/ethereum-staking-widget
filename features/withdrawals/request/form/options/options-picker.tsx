import { useWatch } from 'react-hook-form';

import { formatEther, parseEther } from '@ethersproject/units';
import { TOKENS } from '@lido-sdk/constants';

import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo-click-events';
import { DATA_UNAVAILABLE } from 'consts/text';
import { useWaitingTime } from 'features/withdrawals/hooks/useWaitingTime';
import { RequestFormInputType } from 'features/withdrawals/request/request-form-context';
import { ENABLED_WITHDRAWAL_DEXES } from 'features/withdrawals/withdrawals-constants';
import {
  getDexConfig,
  useWithdrawalRates,
} from 'features/withdrawals/request/withdrawal-rates';
import { useStethByWsteth } from 'shared/hooks';
import { formatBalance } from 'utils/formatBalance';
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
} from './styles';

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
  const { data: wstethAsSteth, initialLoading: isWstethAsStethLoading } =
    useStethByWsteth(DEFAULT_VALUE_FOR_RATE);
  const ratioLoading = !isSteth && isWstethAsStethLoading;
  const ratio = isSteth
    ? '1 : 1'
    : wstethAsSteth
      ? `1 : ${formatBalance(wstethAsSteth).trimmed}`
      : DATA_UNAVAILABLE;

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

const toFloor = (num: number): string =>
  (Math.floor(num * 10000) / 10000).toString();

const DexButton: React.FC<OptionButtonProps> = ({ isActive, onClick }) => {
  const { loading, bestRate, enabledDexes } = useWithdrawalRates({
    fallbackValue: DEFAULT_VALUE_FOR_RATE,
  });
  const isAnyDexEnabled = enabledDexes.length > 0;
  const bestRateValue =
    bestRate && isAnyDexEnabled ? `1 : ${toFloor(bestRate)}` : '—';
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
          {ENABLED_WITHDRAWAL_DEXES.map((dexKey) => {
            const Icon = getDexConfig(dexKey).icon;
            return <Icon key={dexKey}></Icon>;
          })}
        </OptionsPickerIcons>
      </OptionsPickerRow>
      <OptionsPickerRow data-testid="dexBestRate">
        <OptionsPickerSubLabel>Best Rate:</OptionsPickerSubLabel>
        {loading ? <InlineLoaderSmall /> : bestRateValue}
      </OptionsPickerRow>
      <OptionsPickerRow data-testid="dexWaitingTime">
        <OptionsPickerSubLabel>Waiting time:</OptionsPickerSubLabel>{' '}
        {isAnyDexEnabled ? <>~&nbsp;1-5 minutes</> : '—'}
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
