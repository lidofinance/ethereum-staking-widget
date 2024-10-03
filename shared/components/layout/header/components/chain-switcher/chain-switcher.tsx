import { FC, useState, useCallback } from 'react';
import { Option } from '@lidofinance/lido-ui';

import { ReactComponent as OptimismLogo } from 'assets/icons/lido-multichain/optimism.svg';
import { ReactComponent as EthereumMainnetLogo } from 'assets/icons/mainnet.svg';

import { SelectIconStyled } from './styles';
import {
  ChainNameType,
  ETHEREUM,
  OPTIMISM,
  useDappChain,
} from 'providers/dapp-chain';

const iconsMap = {
  [ETHEREUM]: <EthereumMainnetLogo width={28} height={28} />,
  [OPTIMISM]: <OptimismLogo width={28} height={28} />,
};

export const ChainSwitcher: FC = () => {
  const { setChainName } = useDappChain();
  const [value, setValue] = useState<keyof typeof iconsMap>(ETHEREUM);

  const onChange = useCallback(
    // todo: typing
    (value: keyof typeof iconsMap) => {
      setValue(value);
      setChainName(value as ChainNameType);
    },
    [setChainName],
  );

  return (
    <SelectIconStyled
      icon={iconsMap[value]}
      value={value}
      variant="small"
      // arrow="small"
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
  );
};
