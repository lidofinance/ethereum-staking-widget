import { CLIENT_LIMITS, UPSTREAM_BUDGETS } from '../limits';

describe('UPSTREAM_BUDGETS', () => {
  it.each(Object.entries(UPSTREAM_BUDGETS))(
    'lets %s burst within an hour and an hour within a day',
    (_, { maxCallsPerMinute, maxCallsPerHour, maxCallsPerDay }) => {
      expect(maxCallsPerMinute).toBeLessThan(maxCallsPerHour);
      expect(maxCallsPerHour).toBeLessThan(maxCallsPerDay);
      // an hour may take more than its even share of the day
      expect(maxCallsPerHour).toBeGreaterThan(maxCallsPerDay / 24);
    },
  );

  it('keeps one client far below a day of any budget', () => {
    expect(CLIENT_LIMITS.positions).toBeLessThan(
      UPSTREAM_BUDGETS.positions.maxCallsPerDay / 10,
    );
    expect(CLIENT_LIMITS.history).toBeLessThan(
      UPSTREAM_BUDGETS.history.maxCallsPerDay / 10,
    );
    expect(CLIENT_LIMITS.rewards).toBeLessThan(
      UPSTREAM_BUDGETS.rewards.maxCallsPerDay / 10,
    );
  });
});
