import { Component } from 'types';

export type SwitchItemComponent = Component<'a'>;

export type SwitchProps = {
  checked: boolean;
  routes: { name: string; path: string }[];
};
