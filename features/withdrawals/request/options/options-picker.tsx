import { InlineLoader } from '@lidofinance/lido-ui';
import { useWaitingTime } from '../wallet/wallet-waiting-time';
import {
  LidoIcon,
  OptionsPickerButton,
  OptionsPickerContainer,
  OptionsPickerIcons,
  OptionsPickerLabel,
  OptionsPickerRow,
  OptionsPickerSubLabel,
} from './styles';

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

type OptionButtonProps = {
  onClick: React.ComponentProps<'button'>['onClick'];
  isActive?: boolean;
};

const LidoButton: React.FC<OptionButtonProps> = ({ isActive, onClick }) => {
  const { isLoading, value } = useWaitingTime();
  return (
    <OptionsPickerButton $active={isActive} onClick={onClick}>
      <OptionsPickerRow>
        <OptionsPickerLabel>Use Lido</OptionsPickerLabel>
        <OptionsPickerIcons>
          <LidoIcon />
        </OptionsPickerIcons>
      </OptionsPickerRow>
      <OptionsPickerRow>
        <OptionsPickerSubLabel>Rate:</OptionsPickerSubLabel>1 : 1
      </OptionsPickerRow>
      <OptionsPickerRow>
        <OptionsPickerSubLabel>Waiting time</OptionsPickerSubLabel>
        {isLoading ? <InlineLoader /> : value}
      </OptionsPickerRow>
    </OptionsPickerButton>
  );
};

const DexButton: React.FC<OptionButtonProps> = ({ isActive, onClick }) => {
  return (
    <OptionsPickerButton $active={isActive} onClick={onClick}>
      <OptionsPickerRow>
        <OptionsPickerLabel>Use aggregators</OptionsPickerLabel>
        <OptionsPickerIcons>
          <LidoIcon />
        </OptionsPickerIcons>
      </OptionsPickerRow>
      <OptionsPickerRow>
        <OptionsPickerSubLabel>Best Rate:</OptionsPickerSubLabel>1 : 1.3753
      </OptionsPickerRow>
      <OptionsPickerRow>
        <OptionsPickerSubLabel>Waiting time</OptionsPickerSubLabel>~ 1-5 minutes
      </OptionsPickerRow>
    </OptionsPickerButton>
  );
};
