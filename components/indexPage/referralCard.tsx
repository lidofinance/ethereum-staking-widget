// TODO: delete this component!

import { FC, memo, useMemo } from 'react';
import { Copy } from '@lidofinance/lido-ui';
import { css } from 'styled-components';

import { useENSAddress, useCopyToClipboard } from 'hooks';
import AbuseWarning from 'components/abuseWarning';

import {
  ReferralCardBlock,
  ReferralTitleText,
  ReferralLinkBox,
  ReferralLinkBoxInside,
  ReferralCopyBox,
  ReferralInstructionText,
  ReferralLink,
} from './styles';

const ReferralCard: FC = () => {
  const address = useENSAddress();

  const referralLink = useMemo(
    () =>
      address
        ? `https://stake.lido.fi/?ref=${address}`
        : 'Wallet not connected',
    [address],
  );

  const handleCopy = useCopyToClipboard(referralLink);

  return (
    <ReferralCardBlock>
      <ReferralTitleText size="xs">Receive LDO token rewards</ReferralTitleText>
      <ReferralLinkBox>
        <ReferralLinkBoxInside size="xxs">{referralLink}</ReferralLinkBoxInside>
        <ReferralCopyBox onClick={handleCopy}>
          <Copy />
        </ReferralCopyBox>
      </ReferralLinkBox>
      <ReferralInstructionText size="xxs">
        Share your referral link with others and earn LDO tokens for each ETH
        other user{' '}
        <ReferralLink href="/referral">staked with your link.</ReferralLink>
      </ReferralInstructionText>
      <AbuseWarning
        css={css`
          margin: 12px 0 0;
        `}
      />
    </ReferralCardBlock>
  );
};

export default memo(ReferralCard);
