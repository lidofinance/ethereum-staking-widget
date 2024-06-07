import { CHAINS } from '@lido-sdk/constants';
import { useSDK } from '@lido-sdk/react';
import { Text, Link } from '@lidofinance/lido-ui';

import { config } from 'config';

import { SunsetMessageStyle } from './styles';

const URL_INFORMATION = `${config.docsOrigin}/deployed-contracts/goerli/`;
const URL_HOLESKY = `${config.docsOrigin}/deployed-contracts/holesky/#hole%C5%A1ky-testnet`;

export const GoerliSunsetBanner = () => {
  const { chainId } = useSDK();

  if (chainId !== CHAINS.Goerli) return null;

  return (
    <SunsetMessageStyle>
      <Text weight={700} size="sm">
        The Lido testnet on Görli will no longer be supported after February
        29th, 2024.
      </Text>
      <Text weight={400} size="xxs">
        If you have (w)stETH to withdraw, please do so before this date.
        Additional information can be found{' '}
        <Link href={URL_INFORMATION}>here</Link>, and you can locate the Testnet
        staking widget on <Link href={URL_HOLESKY}>Holesky</Link>.
      </Text>
    </SunsetMessageStyle>
  );
};
