import { renderToStaticMarkup } from 'react-dom/server';

import { LossProtectionBanner } from '../loss-protection-banner';

const state = vi.hoisted(() => ({ isDismissed: false }));

vi.mock('shared/hooks/useSsrMode', () => ({ useSsrMode: () => false }));
vi.mock('shared/hooks/use-local-storage', () => ({
  useLocalStorage: () => [state.isDismissed, vi.fn()],
}));
vi.mock('providers/inpage-navigation', () => ({
  useInpageNavigation: () => ({ navigateInpageAnchor: vi.fn() }),
}));
// SVG imports are not transformed in unit tests
vi.mock('assets/earn', () => ({
  LossProtectionIllustration: () => <svg data-testid="illustration" />,
}));

describe('LossProtectionBanner', () => {
  beforeEach(() => {
    state.isDismissed = false;
  });

  it('renders the illustration, the title and a link to the FAQ item', () => {
    const html = renderToStaticMarkup(<LossProtectionBanner />);
    expect(html).toContain('data-testid="loss-protection-banner"');
    expect(html).toContain('data-testid="illustration"');
    expect(html).toContain('Two layers of loss protection');
    expect(html).toContain('href="#faq-loss-protection"');
    expect(html).not.toContain('target="_blank"');
  });

  it('renders nothing after a dismiss', () => {
    state.isDismissed = true;
    expect(renderToStaticMarkup(<LossProtectionBanner />)).toBe('');
  });
});
