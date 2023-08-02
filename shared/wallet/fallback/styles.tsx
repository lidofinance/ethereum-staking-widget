import { Card } from 'shared/wallet';
import styled from 'styled-components';

export const FallbackWalletStyle = styled((props) => <Card {...props} />)`
  text-align: center;
  background: var(--lido-color-error);
  background-image: none !important;
`;
