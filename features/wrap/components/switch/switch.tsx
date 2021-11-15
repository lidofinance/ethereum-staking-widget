import { Component } from 'types';
import { SwitchWrapper, Handle, Label } from './styles';

export type SwitchProps = Component<
  'div',
  {
    checked: boolean;
    checkedLabel: string;
    uncheckedLabel: string;
  }
>;

export const Switch: SwitchProps = (props) => {
  const { checked, onClick, checkedLabel, uncheckedLabel, ...rest } = props;

  return (
    <SwitchWrapper onClick={onClick} {...rest}>
      <Handle $checked={checked} />
      <Label $checked={checked}>{checkedLabel}</Label>
      <Label $checked={!checked}>{uncheckedLabel}</Label>
    </SwitchWrapper>
  );
};
