import React, { FC, useEffect, useState } from 'react';
import { useLidoSWR } from 'shared/hooks';
import OneInchIcon from 'assets/icons/oneinch.svg';
import { PopupWrapper } from 'shared/components';
import { Button, Link, Modal, Text } from '@lidofinance/lido-ui';
import { ButtonLink, GreenSpan } from './styles';
import { use1inchLink } from '../hooks';

export const OneinchPopup: FC<{ modalView: boolean }> = ({ modalView }) => {
  const [isPopupOpen, setPopupOpen] = useState(false);
  const { data } = useLidoSWR<{ rate: number }>('/api/oneinch-rate');
  const rate = (data && data.rate) || 1;

  useEffect(() => {
    if (rate && rate >= 1.0001) {
      setPopupOpen(true);
    }
  }, [rate]);

  const closePopup = () => setPopupOpen(false);

  const formatted1inchRate = rate.toFixed(4);

  const { link, linkTarget } = use1inchLink();

  const discount = (100 - (1 / rate) * 100).toFixed(2);

  return modalView ? (
    <Modal title="Better deal on 1inch!" open={isPopupOpen}>
      <Text size="xs" color="secondary">
        You can get a <GreenSpan>{discount}%</GreenSpan> discount by buying
        stETH on{' '}
        <Link href={link} target={linkTarget}>
          1inch
        </Link>{' '}
        rather than staking directly with Lido.
      </Text>
      <ButtonLink href={link} target={linkTarget}>
        Go to 1inch
      </ButtonLink>
      <Button fullwidth color="secondary" onClick={closePopup}>
        Close and proceed
      </Button>
    </Modal>
  ) : (
    <PopupWrapper
      open={isPopupOpen}
      providerName="1inch"
      providerLink={link}
      icon={OneInchIcon}
      onClose={closePopup}
      rate={formatted1inchRate}
      linkTarget={linkTarget}
    />
  );
};
