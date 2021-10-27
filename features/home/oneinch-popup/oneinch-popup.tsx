import React, { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUniqueConnector, useLidoSWR } from 'shared/hooks';
import OneInchIcon from 'assets/icons/oneinch.svg';
import { PopupWrapper } from 'shared/components';

export const OneinchPopup: FC = () => {
  const router = useRouter();
  const isUniqueConnector = useUniqueConnector();
  const [isPopupOpen, setPopupOpen] = useState(false);
  const { data } = useLidoSWR<{ rate: number }>('/api/oneinch-rate');
  const rate = (data && data.rate) || 0;

  useEffect(() => {
    if (isUniqueConnector || router.query.ref) {
      setPopupOpen(false);
      return;
    }

    if (rate && rate >= 1.0001) {
      setPopupOpen(true);
    }
  }, [isUniqueConnector, rate, router.query.ref]);

  return (
    <PopupWrapper
      open={isPopupOpen}
      providerName="1inch"
      providerLink="https://app.1inch.io/#/1/swap/ETH/steth"
      icon={OneInchIcon}
      onClose={() => setPopupOpen(false)}
      rate={rate.toFixed(4)}
    />
  );
};
