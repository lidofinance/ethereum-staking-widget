import { useWithdrawalRates } from 'features/withdrawals/hooks/useWithdrawalRates';
import {
  DexOptionBlock,
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

import { FormatToken } from 'shared/formatters/format-token';
import { BigNumber } from 'ethers';

const placeholder = Array(3).fill(null);

const dexInfo: {
  [key: string]: {
    title: string;
    icon: JSX.Element;
    link: (amount: string) => string;
  };
} = {
  '1inch': {
    title: '1inch',
    icon: <OneInchIcon />,
    link: (amount: string) => `example.com/${amount}`,
  },
  paraswap: {
    title: 'ParaSwap',
    icon: <ParaSwapIcon />,
    link: (amount: string) => `example.com/${amount}`,
  },
  cowswap: {
    title: 'CowSwap',
    icon: <CowSwapIcon />,
    link: (amount: string) => `example.com/${amount}`,
  },
};

export const DexOptions: React.FC = () => {
  const { data, initialLoading, loading } = useWithdrawalRates();

  return (
    <DexOptionsContainer>
      {initialLoading
        ? placeholder.map((_, i) => <DexOptionLoader key={i} />)
        : data?.map(({ name, toReceive }) => {
            const dex = dexInfo[name];
            if (!dex) return null;
            return (
              <DexOption
                title={dex.title}
                icon={dex.icon}
                url={'100'}
                key={name}
                loading={loading}
                toReceive={toReceive}
              />
            );
          })}
    </DexOptionsContainer>
  );
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
      <DexOptionBlock>
        {icon}
        <DexOptionBlockTitle>{title}</DexOptionBlockTitle>
        <DexOptionBlockLink href={url}>Go to {title}</DexOptionBlockLink>
      </DexOptionBlock>
      {loading ? (
        <InlineLoaderSmall />
      ) : (
        <DexOptionAmount>
          ~ <FormatToken amount={toReceive ?? BigNumber.from(0)} symbol="ETH" />
        </DexOptionAmount>
      )}
    </DexOptionStyled>
  );
};

const DexOptionLoader = () => {
  return <DexOptionStyled $loading={true} />;
};
