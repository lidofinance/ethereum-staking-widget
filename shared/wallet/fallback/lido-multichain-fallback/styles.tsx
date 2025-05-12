import { Button } from '@lidofinance/lido-ui';
import { LIDO_MULTICHAIN_CHAINS } from 'consts/chains';
import { Card } from 'shared/wallet';
import styled, { css } from 'styled-components';

type WrapProps = React.ComponentProps<typeof Card> & {
  chainId: LIDO_MULTICHAIN_CHAINS;
};
export const Wrap = styled((props) => <Card {...props} />)<WrapProps>`
  text-align: center;
  ${({ chainId }: WrapProps) => {
    switch (chainId) {
      case LIDO_MULTICHAIN_CHAINS['zkSync Era']:
        return css`
          background: linear-gradient(52.01deg, #1d1e35 0.01%, #375192 100%);
        `;
      case LIDO_MULTICHAIN_CHAINS.Optimism:
        return css`
          background: linear-gradient(
            52.01deg,
            #37394a 0%,
            #1d1e35 0.01%,
            #b73544 100%
          );
        `;
      case LIDO_MULTICHAIN_CHAINS.Arbitrum:
        return css`
          background: linear-gradient(52.01deg, #1d1e35 0.01%, #12aaff 100%);
        `;
      case LIDO_MULTICHAIN_CHAINS['Polygon PoS']:
        return css`
          background: linear-gradient(52.01deg, #1d1e35 0.01%, #8355cf 100%);
        `;
      case LIDO_MULTICHAIN_CHAINS.Base:
        return css`
          background: linear-gradient(52.01deg, #1d1e35 0.01%, #4782fc 100%);
        `;
      case LIDO_MULTICHAIN_CHAINS.Mantle:
        return css`
          background: linear-gradient(52.56deg, #141b1a 0.01%, #6ad1af 101.31%);
        `;
      case LIDO_MULTICHAIN_CHAINS.Linea:
        return css`
          background: linear-gradient(
            54.15deg,
            #4591ac -13.73%,
            #84dcfb 91.51%
          );
        `;
      case LIDO_MULTICHAIN_CHAINS.Scroll:
        return css`
          background: linear-gradient(
            53.11deg,
            #533a1d -16.35%,
            #ebc28e 91.56%
          );
        `;
      case LIDO_MULTICHAIN_CHAINS['BNB Chain']:
        return css`
          background: linear-gradient(
            54.14deg,
            #8e5e17 -22.38%,
            #f0b90b 91.42%
          );
        `;
      case LIDO_MULTICHAIN_CHAINS['Mode Chain']:
        return css`
          background: linear-gradient(
            54.14deg,
            #626931 -22.38%,
            #b4c740 91.42%
          );
        `;
      case LIDO_MULTICHAIN_CHAINS['Zircuit Chain']:
        return css`
          background: linear-gradient(
            54.14deg,
            #1a4b3c -22.38%,
            #01bb81 91.42%
          );
        `;
      case LIDO_MULTICHAIN_CHAINS.Unichain:
        return css`
          background: linear-gradient(52.01deg, #fc0fa4 0.01%, #8e1459 100%);
        `;
      case LIDO_MULTICHAIN_CHAINS.Metis:
        return css`
          background: linear-gradient(52.01deg, #00cfff 0.01%, #1d3fd4 100%);
        `;
      case LIDO_MULTICHAIN_CHAINS.Soneium:
        return css`
          background: linear-gradient(52.01deg, #9d1451 0.01%, #630876 100%);
        `;
      case LIDO_MULTICHAIN_CHAINS.Lisk:
        return css`
          background: linear-gradient(52.01deg, #2b2212 0.01%, #e0b35e 100%);
        `;
      case LIDO_MULTICHAIN_CHAINS.Swellchain:
        return css`
          background: linear-gradient(52.01deg, #2b2212 0.01%, #2e62e9 100%);
        `;
      default:
        return css`
          background: linear-gradient(
            180deg,
            #6562ff 11.28%,
            #00a3ff 61.02%,
            #63d6d2 100%
          );
        `;
    }
  }}
`;

export const TextStyle = styled.p`
  margin-bottom: 16px;
`;

export const ButtonStyle = styled((props) => <Button {...props} />)`
  background: #ffffff1a;

  &:not(:disabled):hover {
    background: #ffffff66;
  }
`;
