import { getNextNewYear } from '../constants';
import { getCountdownState } from '../countdown';

describe('getCountdownState', () => {
  it('counts down to local midnight of the next New Year', () => {
    const now = new Date(2026, 11, 31, 22, 58, 30);
    expect(getCountdownState(now)).toEqual({
      kind: 'countdown',
      label: '0d 01:01:30',
    });
  });

  it('shows whole days in December', () => {
    const now = new Date(2026, 10, 25, 14, 0, 0);
    expect(getCountdownState(now)).toEqual({
      kind: 'countdown',
      label: '36d 10:00:00',
    });
  });

  it('greets in the first week of January', () => {
    expect(getCountdownState(new Date(2027, 0, 1, 0, 0, 0))).toEqual({
      kind: 'greeting',
      label: 'Happy New Year 2027!',
    });
    expect(getCountdownState(new Date(2027, 0, 7, 23, 59, 59)).kind).toBe(
      'greeting',
    );
  });

  it('counts to the following year after the greeting week', () => {
    const now = new Date(2027, 0, 8, 0, 0, 0);
    expect(getNextNewYear(now)).toEqual(new Date(2028, 0, 1));
    expect(getCountdownState(now).kind).toBe('countdown');
  });
});
