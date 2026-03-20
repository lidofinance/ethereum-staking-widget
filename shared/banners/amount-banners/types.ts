export type AmountBannerABVariant = 'A' | 'B';

export type AmountBannerThresholdLevel = 1 | 2 | 3;

export type AmountBannerCta = {
  text: string;
  href: string;
};

export type AmountBannerConfig = {
  level: AmountBannerThresholdLevel;
  heading: string;
  body: string;
  ctas: AmountBannerCta[];
};
