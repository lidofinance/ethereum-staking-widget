import { BigNumber } from 'ethers';
import { CHAINS, TOKENS, getTokenAddress } from '@lido-sdk/constants';
import { formatEther } from '@ethersproject/units';

import { useWithdrawalRates } from 'features/withdrawals/hooks/useWithdrawalRates';
import { FormatToken } from 'shared/formatters/format-token';

import {
  DexOptionBlockLink,
  DexOptionBlockTitle,
  DexOptionStyled,
  DexOptionsContainer,
  DexOptionAmount,
  InlineLoaderSmall,
  OneInchIcon,
  ParaSwapIcon,
  CowSwapIcon,
} from './styles';

const placeholder = Array(3).fill(null);

const dexInfo: {
  [key: string]: {
    title: string;
    icon: JSX.Element;
    link: (amount: BigNumber, token: TOKENS.STETH | TOKENS.WSTETH) => string;
  };
} = {
  '1inch': {
    title: '1inch',
    icon: <OneInchIcon />,
    link: (amount, token) =>
      `https://app.1inch.io/#/1/simple/swap/${
        token == TOKENS.STETH ? 'stETH' : 'wstETH'
      }/ETH?sourceTokenAmount=${formatEther(amount)}`,
  },
  paraswap: {
    title: 'ParaSwap',
    icon: <ParaSwapIcon />,
    link: (amount, token) =>
      `https://app.paraswap.io/#/${getTokenAddress(
        CHAINS.Mainnet,
        token,
      )}-ETH/${formatEther(amount)}?network=ethereum`,
  },
  cowswap: {
    title: 'CowSwap',
    icon: <CowSwapIcon />,
    link: (amount, token) =>
      `https://swap.cow.fi/#/1/swap/${getTokenAddress(
        CHAINS.Mainnet,
        token,
      )}/ETH?&sellAmount=${formatEther(amount)}`,
  },
};

type DexOptionProps = {
  title: string;
  icon: JSX.Element;
  url: string;
  loading?: boolean;
  toReceive: BigNumber | null;
};

const DexOption: React.FC<DexOptionProps> = ({
  title,
  icon,
  url,
  toReceive,
  loading,
}) => {
  return (
    <DexOptionStyled>
      {icon}
      <DexOptionBlockTitle>{title}</DexOptionBlockTitle>
      <DexOptionBlockLink href={url} target="_blank" rel="noopener noreferrer">
        Go to {title}
      </DexOptionBlockLink>
      <DexOptionAmount>
        {loading ? (
          <InlineLoaderSmall />
        ) : toReceive ? (
          <FormatToken
            approx
            amount={toReceive ?? BigNumber.from(0)}
            symbol="ETH"
          />
        ) : (
          '-'
        )}
      </DexOptionAmount>
    </DexOptionStyled>
  );
};

const DexOptionLoader = () => {
  return <DexOptionStyled $loading={true} />;
};

export const DexOptions: React.FC = () => {
  const { data, initialLoading, loading, amount, selectedToken } =
    useWithdrawalRates();

  return (
    <DexOptionsContainer>
      {initialLoading
        ? placeholder.map((_, i) => <DexOptionLoader key={i} />)
        : data?.map(({ name, toReceive, rate }) => {
            const dex = dexInfo[name];
            if (!dex) return null;
            return (
              <DexOption
                title={dex.title}
                icon={dex.icon}
                url={dex.link(amount, selectedToken)}
                key={name}
                loading={loading}
                toReceive={!rate ? null : toReceive}
              />
            );
          })}
    </DexOptionsContainer>
  );
};
