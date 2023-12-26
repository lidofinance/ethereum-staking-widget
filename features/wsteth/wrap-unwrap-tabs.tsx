import { WRAP_PATH, WRAP_UNWRAP_PATH } from 'config/urls';

import { Wallet } from 'features/wsteth/shared/wallet';
import { WrapForm } from 'features/wsteth/wrap/wrap-form/wrap-form';
import { GoerliSunsetBanner } from 'shared/banners/goerli-sunset';
import { Switch } from 'shared/components/switch';
import NoSsrWrapper from 'shared/components/no-ssr-wrapper';
import { FaqWithMeta } from 'utils/faq';

import { WrapFaq } from './shared/wrap-faq/wrap-faq';
import { UnwrapForm } from './unwrap/unwrap-form';

const NAV_ROUTES = [
  { name: 'Wrap', path: WRAP_PATH },
  { name: 'Unwrap', path: WRAP_UNWRAP_PATH },
];

type WrapUnwrapLayoutProps = {
  mode: 'wrap' | 'unwrap';
  faqWithMeta: FaqWithMeta | null;
};

export const WrapUnwrapTabs = ({
  mode,
  faqWithMeta,
}: WrapUnwrapLayoutProps) => {
  const isUnwrapMode = mode === 'unwrap';
  return (
    <>
      <NoSsrWrapper>
        <Switch checked={isUnwrapMode} routes={NAV_ROUTES} />
        <GoerliSunsetBanner />
        <Wallet />
        {isUnwrapMode ? <UnwrapForm /> : <WrapForm />}
      </NoSsrWrapper>

      {faqWithMeta && <WrapFaq faqWithMeta={faqWithMeta} />}
    </>
  );
};
