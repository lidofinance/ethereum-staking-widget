import { CHAINS } from '@lido-sdk/constants';
import { useSDK } from '@lido-sdk/react';
import { Text } from '@lidofinance/lido-ui';
import { SunsetMessageStyle } from './styles';

export const GoerliSunsetBanner = () => {
  const { chainId } = useSDK();

  if (chainId !== CHAINS.Goerli) return null;

  return (
    <SunsetMessageStyle>
      <Text weight={700} size="sm">
        Görli Testnet is sunsetting, this process is scheduled till&nbsp;the end
        of Q4 2023.
      </Text>
      <Text weight={400} size="xxs">
        Additional information can be found here, and you can locate the Testnet
        staking widget on Holesky.
      </Text>
    </SunsetMessageStyle>
  );
};
