import { MATOMO_EVENT_TYPE } from 'consts/matomo';
import { Component } from 'types';

export type SwitchItemComponent = Component<'a'>;

export type SwitchProps = {
  checked: boolean;
  routes: { name: string; path: string; matomoEvent?: MATOMO_EVENT_TYPE }[];
  fullwidth?: boolean;
  className?: string;
};
