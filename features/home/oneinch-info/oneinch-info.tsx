import { FC, useMemo } from 'react';
import { useLidoSWR } from 'shared/hooks';
import { Button } from '@lidofinance/lido-ui';
import {
  Wrap,
  OneInchIconWrap,
  OneInchIcon,
  TextWrap,
  ButtonWrap,
} from './styles';
import { useConnectorInfo } from '@lido-sdk/web3-react';
import { isDesktop } from 'react-device-detect';

const ONE_INCH_URL = 'https://app.1inch.io/#/1/swap/ETH/steth';
const LEDGER_LIVE_ONE_INCH_DESKTOP_DEEPLINK = 'ledgerlive://discover/1inch-lld';
const LEDGER_LIVE_ONE_INCH_MOBILE_DEEPLINK = 'ledgerlive://discover/1inch-llm';

export const OneinchInfo: FC = () => {
  const { isLedgerLive } = useConnectorInfo();
  const { data } = useLidoSWR<{ rate: number }>('/api/oneinch-rate');
  const rate = (data && data.rate) || 1;
  const discount = (100 - (1 / rate) * 100).toFixed(2);

  const linkProps = useMemo(() => {
    if (isLedgerLive) {
      return {
        href: isDesktop
          ? LEDGER_LIVE_ONE_INCH_DESKTOP_DEEPLINK
          : LEDGER_LIVE_ONE_INCH_MOBILE_DEEPLINK,
        target: '_self',
      };
    } else {
      return {
        href: ONE_INCH_URL,
        target: '_blank',
        rel: 'noopener noreferrer',
      };
    }
  }, [isLedgerLive]);

  if (!rate || rate < 1.0001) return null;

  return (
    <Wrap>
      <OneInchIconWrap>
        <OneInchIcon />
      </OneInchIconWrap>
      <TextWrap>
        Get a <b>{discount}% discount</b> by buying stETH&nbsp;on the 1icnh
        platform
      </TextWrap>
      <ButtonWrap>
        <a {...linkProps}>
          <Button size="xs">Get discount</Button>
        </a>
      </ButtonWrap>
    </Wrap>
  );
};
