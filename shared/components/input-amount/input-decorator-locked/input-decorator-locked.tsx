import { FC } from 'react';
import { Lock, Tooltip } from '@lidofinance/lido-ui';
import { LockWrapper } from './styles';

export const InputDecoratorLocked: FC = (props) => (
  <Tooltip title="Token locked" placement="top" {...props}>
    <LockWrapper>
      <Lock />
    </LockWrapper>
  </Tooltip>
);
