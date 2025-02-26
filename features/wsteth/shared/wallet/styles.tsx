import { Card } from 'shared/wallet';
import styled from 'styled-components';
import { DAPP_CHAIN_TYPE } from 'modules/web3';

interface StyledCardProps {
  $chainType?: DAPP_CHAIN_TYPE;
}

const backgrounds: Partial<Record<DAPP_CHAIN_TYPE, string>> & {
  default: string;
} = {
  [DAPP_CHAIN_TYPE.Optimism]:
    'linear-gradient(52.01deg, #37394A 0%, #1D1E35 0.01%, #B73544 100%)',
  [DAPP_CHAIN_TYPE.Soneium]:
    'linear-gradient(52.01deg, #9d1451 0.01%, #630876 100%)',
  [DAPP_CHAIN_TYPE.Unichain]:
    'linear-gradient(52.01deg, #fc0fa4 0.01%, #8e1459 100%)',
  default: 'linear-gradient(52.01deg, #1b3349 0%, #25697e 100%)',
};

export const StyledCard = styled(Card)<StyledCardProps>`
  background: ${({ $chainType }) => {
    return backgrounds[$chainType ?? 'default'] ?? backgrounds['default'];
  }};
`;
