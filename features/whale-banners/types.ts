export type WhaleBannerABVariant = 'A' | 'B';

export type WhaleBannerThresholdLevel = 1 | 2 | 3;

export type WhaleBannerCta = {
  text: string;
  href: string;
};

export type WhaleBannerConfig = {
  level: WhaleBannerThresholdLevel;
  heading: string;
  body: string;
  ctas: WhaleBannerCta[];
};
