import { useWhaleBannerOnConnect } from './use-whale-banner-on-connect';

/**
 * Invisible component that triggers the whale banner modal on wallet connect.
 * Add to any page that should show the banner.
 */
export const WhaleBannerOnConnectTrigger = () => {
  useWhaleBannerOnConnect();
  return null;
};
