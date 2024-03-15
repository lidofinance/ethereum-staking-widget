import { Button } from '@lidofinance/lido-ui';
import { trackEvent } from '@lidofinance/analytics-matomo';

import { useSwapDiscount } from './use-swap-discount';
import { Wrap, TextWrap, OverlayLink } from './styles';

export const SwapDiscountBanner = ({ children }: React.PropsWithChildren) => {
  const { data, initialLoading } = useSwapDiscount();

  if (initialLoading) return null;

  if (!data || !data.shouldShowDiscount) return <>{children}</>;

  const {
    BannerText,
    Icon,
    discountPercent,
    matomoEvent,
    linkHref,
    CustomLink,
  } = data;
  const Link = CustomLink ?? OverlayLink;
  return (
    <Wrap>
      <Icon />
      <TextWrap>
        <BannerText discountPercent={discountPercent} />
      </TextWrap>
      <Link
        target="_blank"
        rel="noreferrer"
        href={linkHref}
        onClick={() => {
          trackEvent(...matomoEvent);
        }}
      >
        <Button fullwidth size="xs">
          Get discount
        </Button>
      </Link>
    </Wrap>
  );
};
