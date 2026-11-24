import { parsePortfolioSlug } from '../route';

describe('parsePortfolioSlug', () => {
  it.each([
    [undefined, { tab: 'overview', tokenId: null }],
    [[], { tab: 'overview', tokenId: null }],
    [['activity'], { tab: 'activity', tokenId: null }],
    [['token', 'steth'], { tab: 'overview', tokenId: 'steth' }],
  ])('reads %j', (slug, view) => {
    expect(parsePortfolioSlug(slug)).toEqual(view);
  });

  it.each([
    [['token']],
    [['token', '']],
    [['activity', 'x']],
    [['token', 'steth', 'x']],
    [['settings']],
  ])('rejects %j, the page is a 404', (slug) => {
    expect(parsePortfolioSlug(slug)).toBeNull();
  });
});
