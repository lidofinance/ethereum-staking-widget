import styled from 'styled-components';
import { Tooltip, Question } from '@lidofinance/lido-ui';

import { CardBalance } from 'shared/wallet';
import { LIDO_APR_TOOLTIP_TEXT, DATA_UNAVAILABLE } from 'consts/text';
import { useLidoApr } from 'shared/hooks';

export const LidoAprStyled = styled.span`
  color: rgb(97, 183, 95);
`;

export const WalletLidoApr = () => {
  const lidoApr = useLidoApr();
  return (
    <CardBalance
      small
      title={
        <>
          Lido APR *{' '}
          {lidoApr.data && (
            <Tooltip placement="bottom" title={LIDO_APR_TOOLTIP_TEXT}>
              <Question />
            </Tooltip>
          )}
        </>
      }
      loading={lidoApr.isLoading}
      value={
        <LidoAprStyled data-testid="lidoAprHeader">
          {lidoApr.apr ? `${lidoApr.apr}%` : DATA_UNAVAILABLE}
        </LidoAprStyled>
      }
    />
  );
};
