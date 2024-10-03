import { FC, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { Option } from '@lidofinance/lido-ui';

import { ReactComponent as OptimismLogo } from 'assets/icons/chain-toggler/optimism.svg';
import { ReactComponent as EthereumMainnetLogo } from 'assets/icons/chain-toggler/mainnet.svg';

import {
  ChainNameType,
  ETHEREUM,
  OPTIMISM,
  useDappChain,
} from 'providers/dapp-chain';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

import { SelectIconTooltip } from './components/select-icon-tooltip/select-icon-tooltip';
import { SelectIconStyled, SelectIconWrapper } from './styles';

const iconsMap: Record<ChainNameType, ReactNode> = {
  [ETHEREUM]: <EthereumMainnetLogo />,
  [OPTIMISM]: <OptimismLogo />,
};

export const ChainSwitcher: FC = () => {
  const { setChainName } = useDappChain();
  const { isDappActiveAndNetworksMatched } = useDappStatus();
  const router = useRouter();

  const [value, setValue] = useState<ChainNameType>(ETHEREUM);

  const isOnWrapUnwrapPage = router.pathname === '/wrap/[[...mode]]';

  const onChange = useCallback(
    (value: any) => {
      setValue(value as ChainNameType);
      setChainName(value as ChainNameType);
    },
    [setChainName],
  );

  return (
    <SelectIconWrapper>
      <SelectIconStyled
        disabled={!isOnWrapUnwrapPage}
        icon={iconsMap[value]}
        value={value}
        variant="small"
        onChange={onChange}
      >
        <Option leftDecorator={iconsMap[ETHEREUM]} value={ETHEREUM}>
          Ethereum
        </Option>
        <Option leftDecorator={iconsMap[OPTIMISM]} value={OPTIMISM}>
          Optimism
        </Option>
      </SelectIconStyled>
      {isOnWrapUnwrapPage && !isDappActiveAndNetworksMatched && (
        <SelectIconTooltip showArrow={true}>
          {isOnWrapUnwrapPage
            ? 'This network doesn’t match your wallet’s network'
            : 'Don’t forget to switch to Ethereum'}
        </SelectIconTooltip>
      )}
    </SelectIconWrapper>
  );
};
