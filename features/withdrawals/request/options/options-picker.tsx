import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { useRequestForm } from 'features/withdrawals/contexts/request-form-context';
import { useWaitingTime } from 'features/withdrawals/hooks/useWaitingTime';
import { useWithdrawalRates } from 'features/withdrawals/hooks/useWithdrawalRates';
import { useWstethToStethRatio } from 'shared/components/data-table-row-steth-by-wsteth';
import { formatBalance } from 'utils/formatBalance';

import {
  InlineLoaderSmall,
  LidoIcon,
  CowSwapIcon,
  OneInchIcon,
  ParaSwapIcon,
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

const LidoButton: React.FC<OptionButtonProps> = ({ isActive, onClick }) => {
  const { inputValue } = useRequestForm();
  const { isSteth } = useWithdrawals();
  const { value: waitingTime, initialLoading } = useWaitingTime(inputValue, {
    isApproximate: true,
  });
  const { wstethAsStethBN, loading } = useWstethToStethRatio();
  const ratioLoading = !isSteth && loading;
  const ratio = isSteth ? '1 : 1' : `1 : ${formatBalance(wstethAsStethBN)}`;

  return (
    <OptionsPickerButton $active={isActive} onClick={onClick}>
      <OptionsPickerRow>
        <OptionsPickerLabel>Use Lido</OptionsPickerLabel>
        <OptionsPickerIcons>
          <LidoIcon />
        </OptionsPickerIcons>
      </OptionsPickerRow>
      <OptionsPickerRow>
        <OptionsPickerSubLabel>Rate:</OptionsPickerSubLabel>
        {ratioLoading ? <InlineLoaderSmall /> : ratio}
      </OptionsPickerRow>
      <OptionsPickerRow>
        <OptionsPickerSubLabel>Waiting time:</OptionsPickerSubLabel>
        {initialLoading ? <InlineLoaderSmall /> : waitingTime}
      </OptionsPickerRow>
    </OptionsPickerButton>
  );
};

const DexButton: React.FC<OptionButtonProps> = ({ isActive, onClick }) => {
  const { loading, bestRate } = useWithdrawalRates();
  const bestRateValue = bestRate ? `1 : ${bestRate}` : 'N/A';
  return (
    <OptionsPickerButton $active={isActive} onClick={onClick}>
      <OptionsPickerRow>
        <OptionsPickerLabel>Use aggregators</OptionsPickerLabel>
        <OptionsPickerIcons>
          <OneInchIcon />
          <CowSwapIcon />
          <ParaSwapIcon />
        </OptionsPickerIcons>
      </OptionsPickerRow>
      <OptionsPickerRow>
        <OptionsPickerSubLabel>Best Rate:</OptionsPickerSubLabel>
        {loading ? <InlineLoaderSmall /> : bestRateValue}
      </OptionsPickerRow>
      <OptionsPickerRow>
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
        onClick={(e) => {
          e.preventDefault();
          onOptionSelect?.('lido');
        }}
      />
      <DexButton
        isActive={selectedOption === 'dex'}
        onClick={(e) => {
          e.preventDefault();
          onOptionSelect?.('dex');
        }}
      />
    </OptionsPickerContainer>
  );
};
