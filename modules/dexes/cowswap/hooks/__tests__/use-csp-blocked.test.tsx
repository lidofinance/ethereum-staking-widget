import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useCspBlocked } from '../use-csp-blocked';

vi.mock('../../consts', () => ({
  COWSWAP_BASE_URL: 'https://swap.cow.example/',
}));

// run the hook without a DOM: effects fire at once, state is a plain slot
const hookState = vi.hoisted(() => ({ value: null as Error | null }));
vi.mock('react', () => ({
  useState: (initial: Error | null) => [
    hookState.value ?? initial,
    (next: Error | null) => {
      hookState.value = next;
    },
  ],
  useEffect: (effect: () => void) => effect(),
}));

type Listener = (event: unknown) => void;
let listener: Listener | undefined;

const violation = (disposition: 'enforce' | 'report') => ({
  violatedDirective: 'frame-src',
  blockedURI: 'https://swap.cow.example/#/1/swap',
  disposition,
});

describe('useCspBlocked', () => {
  beforeEach(() => {
    hookState.value = null;
    listener = undefined;
    vi.stubGlobal('document', {
      addEventListener: (_type: string, fn: Listener) => {
        listener = fn;
      },
      removeEventListener: vi.fn(),
    });
    useCspBlocked();
  });

  it('ignores a report-only violation', () => {
    listener?.(violation('report'));
    expect(() => useCspBlocked()).not.toThrow();
  });

  it('throws after an enforced violation', () => {
    listener?.(violation('enforce'));
    expect(() => useCspBlocked()).toThrow('CSP blocked CoW widget iframe');
  });
});
