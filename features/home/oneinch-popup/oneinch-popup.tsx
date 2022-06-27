import React, { FC, useEffect, useState } from 'react';
import { useLidoSWR } from 'shared/hooks';
import OneInchIcon from 'assets/icons/oneinch.svg';
import { PopupWrapper } from 'shared/components';
import { Button, Link, Modal, Text } from '@lidofinance/lido-ui';
import { ButtonLink, GreenSpan } from './styles';
import { useConnectorInfo } from '@lido-sdk/web3-react';
import { isDesktop } from 'react-device-detect';

const ONE_INCH_URL = 'https://app.1inch.io/#/1/swap/ETH/steth';
const LEDGER_LIVE_ONE_INCH_DESKTOP_DEEPLINK = 'ledgerlive://discover/1inch-lld';

// doesn't work for now
// const LEDGER_LIVE_ONE_INCH_MOBILE_DEEPLINK = 'ledgerlive://discover/1inch-llm';

export const OneinchPopup: FC<{ modalView: boolean }> = ({ modalView }) => {
  const { isLedgerLive } = useConnectorInfo();
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

  let link = ONE_INCH_URL;
  let linkTarget = '_blank';

  const openInLedgerLive = isLedgerLive && isDesktop;
  if (openInLedgerLive) {
    link = LEDGER_LIVE_ONE_INCH_DESKTOP_DEEPLINK;
    linkTarget = '_self';
  }

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
