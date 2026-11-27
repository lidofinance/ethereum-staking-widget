import {
  DataListRow,
  Divider,
  IconLink,
  TextLink,
} from '@lidofinance/lido-app-ui';

import { EarnCard, EarnCardTitle } from '../../earn-card';
import { InfoBody, InfoList, Links } from './styles';
import type { StrategyInfoLink, StrategyInfoRow } from './types';

type VaultStrategyInfoProps = {
  rows: StrategyInfoRow[];
  links: StrategyInfoLink[];
};

export const VaultStrategyInfo = ({ rows, links }: VaultStrategyInfoProps) => (
  <EarnCard align="stretch" gap={24} data-testid="strategy-info">
    <EarnCardTitle>Strategy info</EarnCardTitle>
    <InfoBody>
      <InfoList flush>
        {rows.map(({ label, value, info }) => (
          <DataListRow
            key={label}
            label={label}
            value={value}
            info={info}
            data-testid="strategy-info-row"
          />
        ))}
      </InfoList>
      <Divider />
      <Links>
        {links.map(({ label, href }) => (
          <TextLink key={href} href={href} icon={<IconLink />}>
            {label}
          </TextLink>
        ))}
      </Links>
    </InfoBody>
  </EarnCard>
);
