import { Component } from 'types';

export type SwitchItemComponent = Component<'a', { href: string }>;

export type SwitchProps = {
  checked: boolean;
  routes: { name: string; path: string }[];
};
