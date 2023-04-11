import { memo, useCallback } from 'react';
import { useWeb3 } from 'reef-knot';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';

import { Checkbox, External } from '@lidofinance/lido-ui';
// import { FormatToken } from 'shared/formatters';
import { RequestStyled, RequestsStatusStyled, LinkStyled } from './styles';

import { formatBalance, getNFTUrl } from 'utils';
import type { RequestStatusesUnion } from 'features/withdrawals/types/request-status';

type RequestItemProps = {
  request: RequestStatusesUnion;
};

const RequestItemRaw: React.FC<RequestItemProps> = ({ request }) => {
  const { chainId } = useWeb3();
  const { claimSelection } = useClaimData();
  const {
    isSelected: getIsSelected,
    canSelectMore,
    setSelected,
  } = claimSelection;
  const { isFinalized, stringId: tokenId } = request;

  const isSelected = getIsSelected(request.stringId);
  const isDisabled = !isFinalized || (!isSelected && !canSelectMore);
  const statusText = isFinalized ? 'Ready to claim' : 'Pending';

  const amountValue =
    'claimableEth' in request ? request.claimableEth : request.amountOfStETH;
  const symbol = 'claimableEth' in request ? 'ETH' : 'stETH';
  const label = `${formatBalance(amountValue)} ${symbol}`;
  // const expectedEth = 'expectedEth' in request ? request.expectedEth : undefined

  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setSelected(tokenId, e.currentTarget.checked),
    [setSelected, tokenId],
  );

  return (
    <RequestStyled $disabled={isDisabled}>
      <Checkbox
        label={label}
        checked={isSelected}
        disabled={isDisabled}
        onChange={handleSelect}
      />
      {/* TODO: uncomment this when the design will be finalized*/}
      {/* {!isFinalized && expectedEth && (
        <>
          &nbsp;(
          <FormatToken prefix="~" amount={expectedEth} symbol="ETH" />)
        </>
      )} */}
      <RequestsStatusStyled $variant={isFinalized ? 'ready' : 'pending'}>
        {statusText}
      </RequestsStatusStyled>
      <LinkStyled href={getNFTUrl(tokenId, chainId)}>
        <External />
      </LinkStyled>
    </RequestStyled>
  );
};

export const RequestItem = memo(RequestItemRaw);
