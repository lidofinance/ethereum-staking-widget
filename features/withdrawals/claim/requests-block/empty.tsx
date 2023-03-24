import { useWeb3 } from 'reef-knot';
import { FC } from 'react';

import { EmptyText, DownloadIcon, EmptyWrapperStyled } from './styles';

type EmptyProps = {
  height: number;
};

export const Empty: FC<EmptyProps> = ({ height }) => {
  const { active } = useWeb3();

  if (!active) {
    return (
      <EmptyWrapperStyled $height={height}>
        <EmptyText>
          <DownloadIcon />
          Connect wallet to see your withdrawal request data{' '}
        </EmptyText>
      </EmptyWrapperStyled>
    );
  }
  return (
    <EmptyWrapperStyled $height={height}>
      <EmptyText>No withdrawal requests detected.</EmptyText>
    </EmptyWrapperStyled>
  );
};
