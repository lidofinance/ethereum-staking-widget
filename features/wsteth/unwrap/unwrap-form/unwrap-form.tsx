import { FC, memo, useEffect } from 'react';
import { useFeatureFlag, VAULTS_BANNER_IS_ENABLED } from 'config/feature-flags';

import { MATOMO_CLICK_EVENTS } from 'consts/matomo-click-events';
import { InputWrap, WrapBlock } from 'features/wsteth/shared/styles';
import { L2Wsteth } from 'shared/banners/l2-banners/l2-wsteth';
import { VaultsBannerInfo } from 'shared/banners/vaults-banner-info';
import { FormController } from 'shared/hook-form/form-controller/form-controller';

import { UnwrapStats } from './unwrap-stats';
import { UnwrapFormProvider } from '../unwrap-form-context';
import { TokenAmountInputUnwrap } from '../unwrap-form-controls/amount-input-unwrap';
import { SubmitButtonUnwrap } from '../unwrap-form-controls/submit-button-unwrap';

export const UnwrapForm: FC = memo(() => {
  const { vaultsBannerIsEnabled } = useFeatureFlag(VAULTS_BANNER_IS_ENABLED);
  // TODO: DEMO, delete later
  useEffect(() => {
    throw new Error('UnwrapForm -> useEffect');
  }, []);

  return (
    <UnwrapFormProvider>
      <WrapBlock data-testid="unwrapForm">
        <FormController>
          <InputWrap>
            <TokenAmountInputUnwrap />
          </InputWrap>
          <SubmitButtonUnwrap />
        </FormController>
        {vaultsBannerIsEnabled ? (
          <VaultsBannerInfo />
        ) : (
          <L2Wsteth matomoEventLink={MATOMO_CLICK_EVENTS.l2BannerUnwrap} />
        )}
        <UnwrapStats />
      </WrapBlock>
    </UnwrapFormProvider>
  );
});
