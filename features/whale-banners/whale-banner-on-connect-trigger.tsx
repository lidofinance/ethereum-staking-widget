import {
  useWhaleBannerOnConnect,
  type WhaleBannerToken,
} from './use-whale-banner-on-connect';

type WhaleBannerOnConnectTriggerProps = {
  token?: WhaleBannerToken;
};

/**
 * Invisible component that triggers the whale banner modal on wallet connect.
 * Add to any page that should show the banner.
 * Pass token='wstETH' on pages that operate with wstETH (e.g. Wrap).
 */
export const WhaleBannerOnConnectTrigger = ({
  token,
}: WhaleBannerOnConnectTriggerProps) => {
  useWhaleBannerOnConnect({ token });
  return null;
};
