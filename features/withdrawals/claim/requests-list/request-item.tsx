import { useCallback } from 'react';
import { useWeb3 } from 'reef-knot/web3-react';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';

import { Checkbox, External } from '@lidofinance/lido-ui';
import { FormatToken } from 'shared/formatters';
import { RequestStyled, LinkStyled } from './styles';

import { getNFTUrl } from 'utils';
import type { RequestStatusesUnion } from 'features/withdrawals/types/request-status';

import { RequestStatus } from './request-item-status';

type RequestItemProps = {
  request: RequestStatusesUnion;
};

export const RequestItem: React.FC<RequestItemProps> = ({ request }) => {
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

  const amountValue =
    'claimableEth' in request ? request.claimableEth : request.amountOfStETH;
  const symbol = 'claimableEth' in request ? 'ETH' : 'stETH';
  const label = (
    <FormatToken showAmountTip amount={amountValue} symbol={symbol} />
  );
  // const expectedEth = 'expectedEth' in request ? request.expectedEth : undefined

  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setSelected(tokenId, e.currentTarget.checked),
    [setSelected, tokenId],
  );

  return (
    <RequestStyled $disabled={isDisabled}>
      <Checkbox
        // TODO: Update Checkbox props in lido-ui
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
      <RequestStatus status={isFinalized ? 'ready' : 'pending'} />
      <LinkStyled href={getNFTUrl(tokenId, chainId)}>
        <External />
      </LinkStyled>
    </RequestStyled>
  );
};
