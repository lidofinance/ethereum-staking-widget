import { FC, useCallback, useState } from 'react';
import { Modal, ModalProps } from '@lidofinance/lido-ui';

import { useElementResize } from 'shared/hooks';
import { useClaimData } from 'features/withdrawals/hooks';

import { ModalContentStyled, ButtonStyled } from './styles';
import { Requests } from '../requests-block/requests';

export const RequestsModal: FC<ModalProps> = (props) => {
  const [contentHeight, setContentHeight] = useState(0);
  const { claimSelection } = useClaimData();

  const onResize = useCallback((data: { width: number; height: number }) => {
    setContentHeight(data.height);
  }, []);

  const resizingElementRef = useElementResize(onResize);

  if (!props.open) return null;

  return (
    <Modal {...props} title="My requests">
      <ButtonStyled onClick={claimSelection.selectAll}>Select all</ButtonStyled>
      <ButtonStyled onClick={claimSelection.clearAll}>Clear all</ButtonStyled>
      <ModalContentStyled ref={resizingElementRef}>
        <Requests height={contentHeight || 200} />
      </ModalContentStyled>
    </Modal>
  );
};
