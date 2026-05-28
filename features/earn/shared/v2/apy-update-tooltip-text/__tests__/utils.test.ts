import { shouldShowApxUpdateTooltip } from '../utils';

describe('shouldShowApxUpdateTooltip', () => {
  it('returns true only when APX is finite, loaded, and tooltip text is present', () => {
    expect(
      shouldShowApxUpdateTooltip({
        apx: 3.5,
        isLoading: false,
        apxUpdateTooltipText: 'Last updated on Jan 1, 2026',
      }),
    ).toBe(true);
  });

  it.each([
    { apx: null, isLoading: false, apxUpdateTooltipText: 'Text' },
    { apx: undefined, isLoading: false, apxUpdateTooltipText: 'Text' },
    { apx: Number.NaN, isLoading: false, apxUpdateTooltipText: 'Text' },
    {
      apx: Number.POSITIVE_INFINITY,
      isLoading: false,
      apxUpdateTooltipText: 'Text',
    },
    { apx: 3.5, isLoading: true, apxUpdateTooltipText: 'Text' },
    { apx: 3.5, isLoading: false, apxUpdateTooltipText: undefined },
    { apx: 3.5, isLoading: false, apxUpdateTooltipText: null },
    { apx: 3.5, isLoading: false, apxUpdateTooltipText: '' },
  ])(
    'returns false for invalid tooltip inputs: %o',
    ({ apx, isLoading, apxUpdateTooltipText }) => {
      expect(
        shouldShowApxUpdateTooltip({
          apx,
          isLoading,
          apxUpdateTooltipText,
        }),
      ).toBe(false);
    },
  );
});
