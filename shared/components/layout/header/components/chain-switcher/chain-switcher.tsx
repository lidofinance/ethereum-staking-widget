import {
  FC,
  ReactNode,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useRouter } from 'next/router';

import { Option } from '@lidofinance/lido-ui';

import { ReactComponent as OptimismLogo } from 'assets/icons/chain-toggler/optimism.svg';
import { ReactComponent as EthereumMainnetLogo } from 'assets/icons/chain-toggler/mainnet.svg';

import { CHAINS } from 'consts/chains';
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
  const { isDappActive, walletChainId } = useDappStatus();
  const router = useRouter();

  const [value, setValue] = useState<ChainNameType>(ETHEREUM);

  const isOnWrapUnwrapPage = useMemo(
    () => router.pathname === '/wrap/[[...mode]]',
    [router.pathname],
  );

  useEffect(() => {
    if (!walletChainId) return;

    if (
      [CHAINS.Mainnet, CHAINS.Holesky, CHAINS.Sepolia].includes(walletChainId)
    ) {
      setValue(ETHEREUM);
      setChainName(ETHEREUM);
    } else if (
      [CHAINS.Optimism, CHAINS.OptimismSepolia].includes(walletChainId) &&
      isOnWrapUnwrapPage
    ) {
      setValue(OPTIMISM);
      setChainName(OPTIMISM);
    }
  }, [walletChainId, isOnWrapUnwrapPage, setChainName]);

  useEffect(() => {
    if (!isOnWrapUnwrapPage) {
      setValue(ETHEREUM);
      setChainName(ETHEREUM);
    }
  }, [isOnWrapUnwrapPage, setChainName]);

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
      {isOnWrapUnwrapPage && !isDappActive && (
        <SelectIconTooltip showArrow={true}>
          {isOnWrapUnwrapPage
            ? 'This network doesn’t match your wallet’s network'
            : 'Don’t forget to switch to Ethereum'}
        </SelectIconTooltip>
      )}
    </SelectIconWrapper>
  );
};
