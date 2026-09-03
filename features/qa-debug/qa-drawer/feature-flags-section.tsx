import { FC } from 'react';
import { Accordion, Checkbox } from '@lidofinance/lido-ui';

import { useConfig } from 'config';
import type { FeatureFlagsType } from 'config/feature-flags';

import { SectionStack } from './styles';

export const FeatureFlagsSection: FC = () => {
  const { featureFlags } = useConfig();
  const { setFeatureFlag, ...flags } = featureFlags;

  return (
    <Accordion summary="Feature flags (applied live)" defaultExpanded>
      <SectionStack>
        {Object.entries(flags).map(([name, value]) => (
          <Checkbox
            key={name}
            label={name}
            checked={Boolean(value)}
            onChange={(event) =>
              setFeatureFlag(
                name as keyof FeatureFlagsType,
                event.currentTarget.checked,
              )
            }
          />
        ))}
      </SectionStack>
    </Accordion>
  );
};
