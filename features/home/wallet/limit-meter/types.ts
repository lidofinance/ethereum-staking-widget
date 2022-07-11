import { FC } from 'react';

export enum LIMIT_LEVEL {
  SAFE,
  WARN,
  REACHED,
}

export type LimitComponent = FC<{ limitLevel: LIMIT_LEVEL }>;
