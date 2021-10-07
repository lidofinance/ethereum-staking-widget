import React, { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import getConfig from 'next/config';
import { useLidoSWR } from '@lido-sdk/react';
import { standardFetcher } from 'utils/standardFetcher';
import OneInchIcon from 'assets/icons/oneinch.svg';
import PopupWrapper from './popupWrapper';
import { OneInchPopupProps } from './types';

const { serverRuntimeConfig } = getConfig();
const { basePath } = serverRuntimeConfig;

const OneInchPopup: FC<OneInchPopupProps> = ({ isUniqueConnector }) => {
  const router = useRouter();
  const [isPopupOpen, setPopupOpen] = useState(false);
  const { data: rate } = useLidoSWR(
    `${basePath ?? ''}/api/oneinch-rate`,
    standardFetcher,
  );

  useEffect(() => {
    if (isUniqueConnector || router.query.ref) {
      setPopupOpen(false);
      return;
    }

    // TODO: check type
    if (rate && typeof rate === 'number' && rate > 1) {
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
      rate={parseFloat(rate as string).toFixed(4)}
    />
  );
};

export default OneInchPopup;
