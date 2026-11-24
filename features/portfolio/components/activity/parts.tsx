import type { FC } from 'react';
import { Identicon, Typography } from '@lidofinance/lido-app-ui';

import { FormatPrice } from 'shared/formatters';
import type {
  PortfolioTransaction,
  PortfolioTransfer,
} from 'utilsApi/portfolio/types';

import {
  getVerifiedIconToken,
  PortfolioTokenGlyph,
  shortenHex,
  formatTransferAmount,
  getParty,
} from '../../utils';
import { TokenIcon } from '../token-icon';
import { Party, PartyIcon, Stack, TransferBox } from './styles';

type TransferCellProps = {
  transfer: PortfolioTransfer;
  transaction: PortfolioTransaction;
};

export const TransferCell: FC<TransferCellProps> = ({
  transfer,
  transaction,
}) => (
  <TransferBox>
    <TokenIcon
      symbol={transfer.symbol}
      iconToken={getVerifiedIconToken({
        symbol: transfer.symbol,
        chainId: transaction.chainId,
        address: transfer.tokenAddress,
        isNative: transfer.tokenAddress === null,
      })}
      chains={[
        {
          slug: transaction.chainSlug,
          name: transaction.chainName,
          address: transfer.tokenAddress,
          isNative: transfer.tokenAddress === null,
          amount: null,
          decimals: 18,
          amountFloat: transfer.amount,
          valueUsd: transfer.valueUsd,
        },
      ]}
    />
    <Stack>
      <Typography as="span" color="default" variant="body">
        {formatTransferAmount(transfer.amount)} {transfer.symbol}
      </Typography>
      <Typography as="span" variant="description" color="secondary">
        <FormatPrice amount={transfer.valueUsd} fallback="—" />
      </Typography>
    </Stack>
  </TransferBox>
);

export const PartyCell: FC<{ transaction: PortfolioTransaction }> = ({
  transaction,
}) => {
  const party = getParty(transaction);
  const isAddress = party.value.startsWith('0x');
  return (
    <Stack>
      <Typography as="span" variant="description" color="secondary">
        {party.label}
      </Typography>
      <Party title={isAddress ? party.value : undefined}>
        {party.product && (
          <PartyIcon>
            <PortfolioTokenGlyph token={party.product} />
          </PartyIcon>
        )}
        {!party.product && party.label !== 'Transaction' && (
          <PartyIcon>
            <Identicon address={party.value} size={16} />
          </PartyIcon>
        )}
        <Typography as="span" color="default" variant="body">
          {isAddress ? shortenHex(party.value) : party.value}
        </Typography>
      </Party>
    </Stack>
  );
};
