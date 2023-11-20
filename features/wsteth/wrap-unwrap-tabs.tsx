import { PageFAQ } from '@lidofinance/ui-faq';

import { Wallet } from 'features/wsteth/shared/wallet';
import { WrapForm } from 'features/wsteth/wrap/wrap-form/wrap-form';
import { Switch } from 'shared/components/switch';
import NoSsrWrapper from 'shared/components/no-ssr-wrapper';

import { UnwrapForm } from './unwrap/unwrap-form';
import { WrapFaq } from './shared/wrap-faq/wrap-faq';

const NAV_ROUTES = [
  { name: 'Wrap', path: '/wrap' },
  { name: 'Unwrap', path: '/wrap/unwrap' },
];

type WrapUnwrapLayoutProps = {
  mode: 'wrap' | 'unwrap';
  pageFAQ?: PageFAQ;
};

export const WrapUnwrapTabs = ({ mode, pageFAQ }: WrapUnwrapLayoutProps) => {
  const isUnwrapMode = mode === 'unwrap';
  return (
    <>
      <NoSsrWrapper>
        <Switch checked={isUnwrapMode} routes={NAV_ROUTES} />
        <Wallet />
        {isUnwrapMode ? <UnwrapForm /> : <WrapForm />}
      </NoSsrWrapper>

      <WrapFaq pageFAQ={pageFAQ} />
    </>
  );
};
