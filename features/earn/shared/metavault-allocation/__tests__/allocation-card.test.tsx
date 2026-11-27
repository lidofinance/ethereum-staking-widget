import { renderToStaticMarkup } from 'react-dom/server';

import { AllocationCard, type AllocationCardProps } from '../allocation-card';
import { AllocationDetails } from '../allocation-details';
import type { AllocationTableData } from '../types';
import { formatUpdatedDate, getBarLabel } from '../utils';

// The real icon libraries load SVG assets that are not needed here.
vi.mock('features/earn/shared/vault-allocation/protocol-icon', () => ({
  ProtocolIcon: ({ badge }: { badge: string }) => (
    <span data-testid="protocol-icon">{badge}</span>
  ),
}));

const DATA: AllocationTableData = {
  lastUpdated: 1_763_568_360,
  totalTvlUsd: 166_700_000,
  chartData: [
    { name: 'Lido stRATEGY', color: '#008bff', allocation: 88.9 },
    { name: 'wstETH', color: '#6355fe', allocation: 7.3 },
    { name: 'Others', color: '#dd11e8', allocation: 0.9, isSummary: true },
    { name: 'Available', color: '#00ccb3', allocation: 0.05, isSummary: true },
  ],
  groups: [
    {
      name: 'Lido stRATEGY',
      info: 'A professionally curated strategy',
      allocation: 88.9,
      tvlUSD: 153_700_000,
      items: [
        {
          id: 'spark',
          label: 'Spark leveraged wstETH/ETH',
          chain: 'ethereum',
          allocation: 18.2,
          tvlUSD: 29_200_000,
        },
      ],
    },
  ],
  flatItems: [
    { name: 'wstETH', allocation: 7.3, tvlUSD: 12_700_000 },
    {
      name: 'Others',
      isSummary: true,
      info: 'The amount of a newly allocated position',
      allocation: 0.9,
      tvlUSD: 1_500_000,
    },
    {
      name: 'Available',
      isSummary: true,
      info: 'The amount of tokens available for withdrawals',
      allocation: 0.05,
      tvlUSD: 83_000,
    },
  ],
};

const EMPTY_DATA: AllocationTableData = {
  lastUpdated: 0,
  chartData: [],
  groups: [],
  totalTvlUsd: 0,
};

const render = (props: Partial<AllocationCardProps> = {}) =>
  renderToStaticMarkup(
    <AllocationCard data={DATA} isLoading={false} isError={false} {...props} />,
  );

const text = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

describe('AllocationCard', () => {
  it('renders the collapsed card with total, bar and legend', () => {
    const html = render({ id: 'strategy', updatedTooltip: 'Mellow data' });
    const content = text(html);

    expect(html).toContain('id="strategy"');
    expect(content).toContain('Portfolio allocation');
    expect(content).toContain(`Updated ${formatUpdatedDate(DATA.lastUpdated)}`);
    expect(content).toContain('$166.7M Total TVL');
    expect(html).toContain('data-testid="allocation-chart"');
    expect(html).toContain('#008bff');
    expect(content).toContain('Lido stRATEGY 88.9%');
    expect(content).toContain('Show more');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('data-testid="allocation-details"');
  });

  it('makes the update tooltip trigger focusable', () => {
    const html = render({ updatedTooltip: 'Mellow data' });

    expect(html).toContain('aria-label="About the allocation data"');
    expect(html).toContain('tabindex="0"');
  });

  it('hides the tooltip trigger when no tooltip text is given', () => {
    expect(render()).not.toContain('About the allocation data');
  });

  it('shows skeletons while loading', () => {
    const html = render({ data: EMPTY_DATA, isLoading: true });

    expect(html).toContain('data-testid="allocation-loading"');
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain('Updated');
  });

  it('shows a message when there is no data', () => {
    const html = render({ data: EMPTY_DATA });

    expect(html).toContain('data-testid="no-allocation-data"');
    expect(text(html)).toContain('No data available for now');
  });

  it('shows an error message when the request fails', () => {
    const html = render({ data: EMPTY_DATA, isError: true });

    expect(text(html)).toContain('Allocation data is not available');
  });
});

describe('AllocationDetails', () => {
  const html = renderToStaticMarkup(
    <AllocationDetails groups={DATA.groups} flatItems={DATA.flatItems} />,
  );
  const content = text(html);

  it('renders a group with its info text and strategy table', () => {
    expect(content).toContain('Lido stRATEGY 88.9% of total $153.7M');
    expect(content).toContain('A professionally curated strategy');
    expect(content).toContain('Strategy Share TVL');
    expect(content).toContain('Spark leveraged wstETH/ETH 18.2% $29.2M');
    expect(html).toContain('data-testid="protocol-icon"');
  });

  it('renders flat items as summary rows with their info text', () => {
    expect(content).toContain('wstETH 7.3% of total $12.7M');
    expect(content).toContain(
      'Others 0.9% of total $1.5M The amount of a newly allocated position',
    );
  });

  it('hides the share of a summary row below the display limit', () => {
    expect(content).toContain(
      'Available $83K The amount of tokens available for withdrawals',
    );
  });
});

describe('allocation utils', () => {
  it('formats the update date without a year', () => {
    expect(formatUpdatedDate(DATA.lastUpdated)).toMatch(
      /^[A-Z][a-z]{2} \d{1,2}, \d{2}:\d{2}$/,
    );
  });

  it('builds the bar label from visible shares', () => {
    expect(getBarLabel(DATA.chartData)).toBe(
      'Portfolio allocation: Lido stRATEGY 88.9%, wstETH 7.3%, Others 0.9%, Available',
    );
  });
});
