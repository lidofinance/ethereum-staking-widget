import { getTokenActions } from '../token-actions';

const labels = (token?: Parameters<typeof getTokenActions>[0]) =>
  getTokenActions(token).map((action) => action.label);

describe('getTokenActions', () => {
  it('matches the design for Lido tokens', () => {
    expect(labels('steth')).toEqual(['Stake more', 'Unstake', 'Wrap', 'Swap']);
    expect(labels('wsteth')).toEqual([
      'Stake more',
      'Unstake',
      'Unwrap',
      'Swap',
    ]);
    expect(labels('earneth')).toEqual(['Supply more', 'Withdraw', 'Swap']);
  });

  it('links Earn actions to the vault pages', () => {
    expect(getTokenActions('earnusd').map((action) => action.href)).toEqual([
      '/earn/usd/deposit',
      '/earn/usd/withdraw',
      '/swap',
    ]);
  });

  it('highlights only the main action', () => {
    expect(
      getTokenActions('steth').filter((action) => action.highlight),
    ).toHaveLength(1);
  });

  it('has no actions for unverified tokens', () => {
    expect(labels(undefined)).toEqual([]);
  });
});
