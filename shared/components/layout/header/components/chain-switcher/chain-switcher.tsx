import { FC, ReactNode } from 'react';

import { Option } from '@lidofinance/lido-ui';

import { ReactComponent as OptimismLogo } from 'assets/icons/chain-toggler/optimism.svg';
import { ReactComponent as EthereumMainnetLogo } from 'assets/icons/chain-toggler/mainnet.svg';

import { DAPP_CHAIN_TYPE } from 'modules/web3';
import { useDappStatus } from 'modules/web3';

import { SelectIconTooltip } from './components/select-icon-tooltip/select-icon-tooltip';
import { SelectIconStyled, SelectIconWrapper } from './styles';

const iconsMap: Record<DAPP_CHAIN_TYPE, ReactNode> = {
  [DAPP_CHAIN_TYPE.Ethereum]: <EthereumMainnetLogo />,
  [DAPP_CHAIN_TYPE.Optimism]: <OptimismLogo />,
};

export const ChainSwitcher: FC = () => {
  const { isDappActive, chainType, supportedChainTypes, setChainType } =
    useDappStatus();

  const isChainTypeUnlocked = supportedChainTypes.length > 1;

  return (
    <SelectIconWrapper>
      <SelectIconStyled
        disabled={!isChainTypeUnlocked}
        icon={iconsMap[chainType]}
        value={chainType}
        variant="small"
        onChange={setChainType as any}
      >
        <Option
          leftDecorator={iconsMap[DAPP_CHAIN_TYPE.Ethereum]}
          value={DAPP_CHAIN_TYPE.Ethereum}
        >
          Ethereum
        </Option>
        <Option
          leftDecorator={iconsMap[DAPP_CHAIN_TYPE.Optimism]}
          value={DAPP_CHAIN_TYPE.Optimism}
        >
          Optimism
        </Option>
      </SelectIconStyled>
      {isChainTypeUnlocked && !isDappActive && (
        <SelectIconTooltip showArrow={true}>
          This network doesn’t match your wallet’s network
        </SelectIconTooltip>
      )}
    </SelectIconWrapper>
  );
};
