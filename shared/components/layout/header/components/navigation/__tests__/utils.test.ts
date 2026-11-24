import { describe, it, expect } from 'vitest';

import type { PageRoute } from '../types';
import { flattenSingleSection } from '../utils';

const page = (name: string): PageRoute => ({
  name,
  path: `/${name}`,
  icon: null,
});
const stake: PageRoute = {
  name: 'Stake',
  icon: null,
  subRoutes: [page('stake'), page('wrap'), page('withdrawals')],
};

describe('flattenSingleSection', () => {
  it('shows the pages of the only section as top-level routes', () => {
    expect(flattenSingleSection([stake])).toEqual(stake.subRoutes);
  });

  it('keeps the routes when other products are available', () => {
    const routes = [stake, page('earn')];
    expect(flattenSingleSection(routes)).toBe(routes);
  });

  it('keeps standalone links after the flattened section', () => {
    const portfolio = { ...page('portfolio'), standalone: true };
    expect(flattenSingleSection([stake, portfolio])).toEqual([
      ...stake.subRoutes,
      portfolio,
    ]);
  });

  it('keeps sections when a standalone link sits next to other products', () => {
    const routes = [
      stake,
      page('earn'),
      { ...page('portfolio'), standalone: true },
    ];
    expect(flattenSingleSection(routes)).toBe(routes);
  });

  it('keeps a lone standalone link as is', () => {
    const routes = [{ ...page('portfolio'), standalone: true }];
    expect(flattenSingleSection(routes)).toBe(routes);
  });

  it('keeps a single page route as is', () => {
    const routes = [page('earn')];
    expect(flattenSingleSection(routes)).toBe(routes);
  });
});
