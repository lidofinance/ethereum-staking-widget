import { Fragment, type ReactNode } from 'react';
import { Divider, Typography } from '@lidofinance/lido-app-ui';

import { FormatLargeAmount } from 'shared/formatters/format-large-amount';
import { FormatPercent } from 'shared/formatters/format-percent';
import { ProtocolIcon } from 'features/earn/shared/vault-allocation/protocol-icon';

import type {
  AllocationGroup,
  AllocationSubItem,
  FlatAllocationItem,
} from './types';
import { isShareVisible } from './utils';
import {
  Details,
  GroupBlock,
  NumberHeader,
  StrategyIcon,
  StrategyName,
  StrategyTable,
  Summary,
  SummaryLine,
  SummaryName,
  SummaryValue,
} from './styles';

type AllocationSummaryRowProps = {
  name: string;
  allocation: number;
  tvlUSD: number;
  info?: ReactNode;
  showShare: boolean;
};

const AllocationSummaryRow = ({
  name,
  allocation,
  tvlUSD,
  info,
  showShare,
}: AllocationSummaryRowProps) => (
  <Summary>
    <SummaryLine>
      <SummaryName>
        <Typography as="h3" variant="body" weight="semibold" color="default">
          {name}
        </Typography>
        {showShare && (
          <Typography as="span" variant="description" color="tertiary">
            <FormatPercent value={allocation} decimals="percent" /> of total
          </Typography>
        )}
      </SummaryName>
      <SummaryValue>
        <Typography as="span" variant="body" weight="semibold" color="default">
          <FormatLargeAmount amount={tvlUSD} />
        </Typography>
      </SummaryValue>
    </SummaryLine>
    {info && (
      <Typography variant="description" color="tertiary">
        {info}
      </Typography>
    )}
  </Summary>
);

const StrategyRow = ({ item }: { item: AllocationSubItem }) => (
  <tr>
    <td>
      <StrategyName>
        <StrategyIcon>
          <ProtocolIcon
            mainIcon={item.icon ? <item.icon /> : null}
            badge={item.chain}
          />
        </StrategyIcon>
        <Typography as="span" variant="body" color="secondary">
          {item.label}
        </Typography>
      </StrategyName>
    </td>
    <td>
      <Typography as="span" variant="body" color="secondary">
        <FormatPercent value={item.allocation} decimals="percent" />
      </Typography>
    </td>
    <td>
      <Typography as="span" variant="body" color="secondary">
        <FormatLargeAmount amount={item.tvlUSD} />
      </Typography>
    </td>
  </tr>
);

const HeaderCell = ({ children }: { children: ReactNode }) => (
  <Typography as="span" variant="description" color="secondary">
    {children}
  </Typography>
);

const AllocationGroupBlock = ({ group }: { group: AllocationGroup }) => (
  <GroupBlock data-testid="allocation-group">
    <AllocationSummaryRow
      name={group.name}
      allocation={group.allocation}
      tvlUSD={group.tvlUSD}
      info={group.info}
      showShare
    />
    {group.items.length > 0 && (
      <StrategyTable aria-label={`${group.name} strategies`}>
        <thead>
          <tr>
            <th scope="col">
              <HeaderCell>Strategy</HeaderCell>
            </th>
            <NumberHeader scope="col">
              <HeaderCell>Share</HeaderCell>
            </NumberHeader>
            <NumberHeader scope="col">
              <HeaderCell>TVL</HeaderCell>
            </NumberHeader>
          </tr>
        </thead>
        <tbody>
          {group.items.map((item) => (
            <StrategyRow key={`${item.id}-${item.chain}`} item={item} />
          ))}
        </tbody>
      </StrategyTable>
    )}
  </GroupBlock>
);

type AllocationDetailsProps = {
  id?: string;
  groups: AllocationGroup[];
  flatItems?: FlatAllocationItem[];
};

export const AllocationDetails = ({
  id,
  groups,
  flatItems = [],
}: AllocationDetailsProps) => {
  const blocks = [
    ...groups.map((group, index) => ({
      key: `group-${group.name}-${index}`,
      node: <AllocationGroupBlock group={group} />,
    })),
    ...flatItems.map((item, index) => ({
      key: `item-${item.name}-${index}`,
      node: (
        <AllocationSummaryRow
          name={item.name}
          allocation={item.allocation}
          tvlUSD={item.tvlUSD}
          info={item.info}
          showShare={isShareVisible(item)}
        />
      ),
    })),
  ];

  return (
    <Details id={id} data-testid="allocation-details">
      {blocks.map(({ key, node }, index) => (
        <Fragment key={key}>
          {index > 0 && <Divider />}
          {node}
        </Fragment>
      ))}
    </Details>
  );
};
