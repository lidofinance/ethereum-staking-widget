import { useClaimData } from 'features/withdrawals/hooks';
import { Requests } from './requests';

import { Wrapper, ButtonStyled, SettingsWrapperStyled } from './styles';

export const RequestsBlock = () => {
  const { claimSelection, withdrawalRequestsData, requests } = useClaimData();

  const isEmpty = withdrawalRequestsData.loading || requests.length === 0;

  return (
    <Wrapper>
      <SettingsWrapperStyled>
        <ButtonStyled onClick={claimSelection.selectAll} disabled={isEmpty}>
          Select all
        </ButtonStyled>
        <ButtonStyled onClick={claimSelection.clearAll} disabled={isEmpty}>
          Clear all
        </ButtonStyled>
      </SettingsWrapperStyled>
      <Requests height={146} />
    </Wrapper>
  );
};
