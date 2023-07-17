import { InfoBoxStyled } from 'features/withdrawals/shared';
import { LocalLink } from 'shared/components/local-link';

export const BunkerInfo = () => {
  return (
    <InfoBoxStyled>
      Lido protocol is in &quot;Bunker mode&quot;. The withdrawal requests are
      slowed down until the consequences of the incident that caused
      &quot;Bunker mode&quot; are not resolved. For more details,{' '}
      <LocalLink href="#bunkerModeScenarios">see here</LocalLink>.
    </InfoBoxStyled>
  );
};
