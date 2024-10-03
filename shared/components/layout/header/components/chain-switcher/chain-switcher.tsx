import { FC, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Option } from '@lidofinance/lido-ui';

import { ReactComponent as OptimismLogo } from 'assets/icons/lido-multichain/optimism.svg';
import { ReactComponent as EthereumMainnetLogo } from 'assets/icons/mainnet.svg';

import {
  ChainNameType,
  ETHEREUM,
  OPTIMISM,
  useDappChain,
} from 'providers/dapp-chain';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

import { SelectIconTooltip } from './components/select-icon-tooltip/select-icon-tooltip';
import { SelectIconStyled } from './styles';

const iconsMap = {
  [ETHEREUM]: <EthereumMainnetLogo width={28} height={28} />,
  [OPTIMISM]: <OptimismLogo width={28} height={28} />,
};

export const ChainSwitcher: FC = () => {
  const { setChainName } = useDappChain();
  const { isDappActiveAndNetworksMatched } = useDappStatus();
  const router = useRouter();

  const [value, setValue] = useState<keyof typeof iconsMap>(ETHEREUM);

  const isOnWrapUnwrapPage = router.pathname === '/wrap/[[...mode]]';

  const onChange = useCallback(
    // todo: typing
    (value: keyof typeof iconsMap) => {
      setValue(value);
      setChainName(value as ChainNameType);
    },
    [setChainName],
  );

  return (
    <div style={{ position: 'relative' }}>
      <SelectIconStyled
        disabled={!isOnWrapUnwrapPage}
        icon={iconsMap[value]}
        value={value}
        variant="small"
        // todo: typing
        onChange={(value: any) => onChange(value)}
      >
        <Option leftDecorator={iconsMap[ETHEREUM]} value={ETHEREUM}>
          Ethereum
        </Option>
        <Option leftDecorator={iconsMap[OPTIMISM]} value={OPTIMISM}>
          Optimism
        </Option>
      </SelectIconStyled>
      {!isDappActiveAndNetworksMatched && (
        <SelectIconTooltip showArrow={true}>
          {isOnWrapUnwrapPage
            ? 'This network doesn’t match your wallet’s network'
            : 'Don’t forget to switch to Ethereum'}
        </SelectIconTooltip>
      )}
    </div>
  );
};
