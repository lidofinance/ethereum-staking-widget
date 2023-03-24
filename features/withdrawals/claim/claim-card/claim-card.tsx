import { useState } from 'react';

import { ClaimStatItem } from './claim-stat-item';
import {
  ClaimCardStyled,
  ClaimInfoStyled,
  ClaimInfoStatStyled,
  ClaimCardEditStyled,
} from './styles';

import { RequestsModal } from '../requests-modal';

export const ClaimCard = () => {
  const [isShowRequestsModal, setIsShowRequestsModal] = useState(false);

  return (
    <ClaimCardStyled>
      <ClaimInfoStyled>
        <ClaimInfoStatStyled>
          <ClaimStatItem title="Total claimable rewards" symbol="ETH" $bold />
        </ClaimInfoStatStyled>
        <ClaimInfoStatStyled>
          <ClaimStatItem title="Pending amount" symbol="ETH" />
        </ClaimInfoStatStyled>
      </ClaimInfoStyled>
      <ClaimCardEditStyled onClick={() => setIsShowRequestsModal(true)}>
        Edit reward claims
      </ClaimCardEditStyled>
      <RequestsModal
        open={isShowRequestsModal}
        onClose={() => setIsShowRequestsModal(false)}
      />
    </ClaimCardStyled>
  );
};
