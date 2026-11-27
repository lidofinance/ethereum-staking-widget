import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { VaultFaq, isFaqHash } from '../vault-faq';

const state = vi.hoisted(() => ({
  hashNav: '',
  open: undefined as boolean | undefined,
}));

vi.mock('providers/inpage-navigation', () => ({
  useInpageNavigation: () => ({
    hashNav: state.hashNav,
    resetInpageAnchor: vi.fn(),
  }),
}));
vi.mock('../../faq', () => ({
  FaqDrawer: ({ open, children }: { open: boolean; children: ReactNode }) => {
    state.open = open;
    return <div data-testid="drawer">{children}</div>;
  },
}));

describe('isFaqHash', () => {
  it.each([
    ['faq', true],
    ['faq-apy', true],
    ['performance', false],
    ['', false],
    [undefined, false],
  ])('%s -> %s', (hash, expected) => {
    expect(isFaqHash(hash)).toBe(expected);
  });
});

describe('VaultFaq', () => {
  it('is closed without a FAQ hash', () => {
    state.hashNav = 'strategy';
    renderToStaticMarkup(<VaultFaq raised={false}>answers</VaultFaq>);
    expect(state.open).toBe(false);
  });

  it('opens for a FAQ item hash', () => {
    state.hashNav = 'faq-apy';
    renderToStaticMarkup(<VaultFaq raised={false}>answers</VaultFaq>);
    expect(state.open).toBe(true);
  });
});
