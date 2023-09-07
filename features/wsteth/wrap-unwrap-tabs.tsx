import { Switch } from 'shared/components/switch';
import { Wallet } from 'features/wsteth/shared/wallet';
import { WrapForm } from 'features/wsteth/wrap/wrap-form/wrap-form';
import { UnwrapForm } from './unwrap/unwrap-form';
import { WrapFaq } from './shared/wrap-faq/wrap-faq';
import NoSsrWrapper from 'shared/components/no-ssr-wrapper';

const NAV_ROUTES = [
  { name: 'Wrap', path: '/wrap' },
  { name: 'Unwrap', path: '/wrap/unwrap' },
];

type WrapUnwrapLayoutProps = {
  mode: 'wrap' | 'unwrap';
};

export const WrapUnwrapTabs = ({ mode }: WrapUnwrapLayoutProps) => {
  const isUnwrapMode = mode === 'unwrap';
  return (
    <>
      <NoSsrWrapper>
        <Switch checked={isUnwrapMode} routes={NAV_ROUTES} />
        <Wallet />
        {isUnwrapMode ? <UnwrapForm /> : <WrapForm />}
      </NoSsrWrapper>
      <WrapFaq />
    </>
  );
};
