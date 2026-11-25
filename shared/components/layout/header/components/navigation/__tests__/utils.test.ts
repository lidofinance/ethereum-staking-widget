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

  it('keeps a single page route as is', () => {
    const routes = [page('earn')];
    expect(flattenSingleSection(routes)).toBe(routes);
  });
});
