import {
  FC,
  ReactNode,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';

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
  const { chainId } = useAccount();
  const { setChainName } = useDappChain();
  const { isDappActiveAndNetworksMatched } = useDappStatus();
  const router = useRouter();

  const [value, setValue] = useState<ChainNameType>(ETHEREUM);

  const isOnWrapUnwrapPage = useMemo(
    () => router.pathname === '/wrap/[[...mode]]',
    [router.pathname],
  );

  useEffect(() => {
    if (!chainId) return;

    if ([CHAINS.Mainnet, CHAINS.Holesky, CHAINS.Sepolia].includes(chainId)) {
      setValue(ETHEREUM);
      setChainName(ETHEREUM);
    } else if ([CHAINS.Optimism, CHAINS.OptimismSepolia].includes(chainId)) {
      setValue(OPTIMISM);
      setChainName(OPTIMISM);
    }
  }, [chainId, setChainName]);

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
