import { useInpageNavigation } from 'providers/inpage-navigation';
import { InfoBoxStyled } from 'features/withdrawals/shared';

export const BunkerInfo = () => {
  const { navigateInpageAnchor } = useInpageNavigation();

  return (
    <InfoBoxStyled>
      Lido protocol is in &quot;Bunker mode&quot;. The withdrawal requests are
      slowed down until the consequences of the incident that caused
      &quot;Bunker mode&quot; are not resolved. For more details,{' '}
      <a href="#bunkerModeScenarios" onClick={navigateInpageAnchor}>
        see here
      </a>
      .
    </InfoBoxStyled>
  );
};
