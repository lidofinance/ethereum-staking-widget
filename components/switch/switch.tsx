import { SwitchWrapper, Handle, Label } from './switchStyles';
import { SwitchProps } from './types';

const Switch: SwitchProps = (props) => {
  const { checked, onClick, checkedLabel, uncheckedLabel, ...rest } = props;

  return (
    <SwitchWrapper onClick={onClick} {...rest}>
      <Handle $checked={checked} />
      <Label $checked={checked}>{checkedLabel}</Label>
      <Label $checked={!checked}>{uncheckedLabel}</Label>
    </SwitchWrapper>
  );
};

export default Switch;
