import { Component } from 'types';

export type SwitchProps = Component<
  'div',
  {
    checked: boolean;
    checkedLabel: string;
    uncheckedLabel: string;
  }
>;
