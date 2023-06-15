import styled from 'styled-components';
import { CheckLarge, Close, Loader } from '@lidofinance/lido-ui';

export const TxLoader = styled(Loader)`
  margin: 0 auto;
`;

export const IconWrapper = styled.div`
  height: 64px;
  width: 100%;
  text-align: center;
`;

export const LedgerIconWrapper = styled.div`
  width: 100%;
  text-align: center;

  svg {
    max-width: 100%;
  }
`;

export const SuccessIcon = styled(CheckLarge)`
  padding: 20px;
  border: 2px solid var(--lido-color-success);
  border-radius: 50%;
  color: var(--lido-color-success);
`;

export const FailIcon = styled(Close)`
  padding: 20px;
  border: 2px solid var(--lido-color-error);
  border-radius: 50%;
  color: var(--lido-color-error);
`;
