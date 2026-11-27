import { renderToStaticMarkup } from 'react-dom/server';

import { EarnInfoBanner } from '../earn-info-banner';

type BannerConfig = { title?: string; text?: string };

type State = {
  enabled: boolean;
  banner: BannerConfig;
  dismissedText: string | null;
};

const state = vi.hoisted<State>(() => ({
  enabled: true,
  banner: {},
  dismissedText: null,
}));

vi.mock('config', () => ({
  useConfig: () => ({
    externalConfig: {
      featureFlags: { earnInfoBannerEnabled: state.enabled },
      earnInfoBanner: state.banner,
    },
  }),
}));
vi.mock('shared/hooks/useSsrMode', () => ({ useSsrMode: () => false }));
vi.mock('shared/hooks/use-local-storage', () => ({
  useLocalStorage: () => [state.dismissedText, vi.fn()],
}));

const render = () => renderToStaticMarkup(<EarnInfoBanner />);

describe('EarnInfoBanner', () => {
  beforeEach(() => {
    state.enabled = true;
    state.banner = { title: 'Title', text: 'Text' };
    state.dismissedText = null;
  });

  it('renders the title, the text and a close button', () => {
    const html = render();
    expect(html).toContain('data-testid="earn-info-banner"');
    expect(html).toContain('Title');
    expect(html).toContain('Text');
    expect(html).toContain('aria-label="Close"');
  });

  it.each([
    ['the flag is off', () => (state.enabled = false)],
    ['there is no text', () => (state.banner = { title: 'Title' })],
    ['this text was dismissed', () => (state.dismissedText = 'Text')],
  ])('renders nothing when %s', (_, arrange) => {
    arrange();
    expect(render()).toBe('');
  });

  it('shows again when the text changes after a dismiss', () => {
    state.dismissedText = 'Old text';
    expect(render()).toContain('Text');
  });
});
