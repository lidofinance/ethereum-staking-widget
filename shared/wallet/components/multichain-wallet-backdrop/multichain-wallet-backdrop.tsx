import { LIDO_MULTICHAIN_CHAINS } from 'consts/chains';
import { Card } from 'shared/wallet/card';
import styled, { css } from 'styled-components';

type MultiChainWalletBackdropProps = React.ComponentProps<typeof Card> & {
  multiChainId?: LIDO_MULTICHAIN_CHAINS;
};
export const MultiChainWalletBackdrop = styled(({ multiChainId, ...props }) => (
  <Card {...props} />
))<MultiChainWalletBackdropProps>`
  text-align: center;
  ${({ multiChainId }) => {
    if (!multiChainId) return '';
    switch (multiChainId) {
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
      case LIDO_MULTICHAIN_CHAINS.Base:
        return css`
          background: linear-gradient(52.01deg, #1d1e35 0.01%, #4782fc 100%);
        `;
      case LIDO_MULTICHAIN_CHAINS.Linea:
        return css`
          background: linear-gradient(52deg, #190066 0.01%, #84dcfb 100%);
        `;
      case LIDO_MULTICHAIN_CHAINS['BNB Chain']:
        return css`
          background: linear-gradient(
            54.14deg,
            #8e5e17 -22.38%,
            #f0b90b 91.42%
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
