import styled from 'styled-components';
import { InlineLoader } from '@lidofinance/lido-ui';
import { BannerWrap } from '../shared-banner-partials';

export const Wrap = styled(BannerWrap)`
  background: ${({ theme }) =>
    theme.name === 'dark'
      ? '#28282F'
      : 'radial-gradient(25% 100% at 60% 10%, #ecf2ff 0%, #ebedff 100%)'};
  color: var(--lido-color-text);
`;

export const Description = styled.div`
  margin-top: 5px;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 400;
  line-height: 24px;
`;

export const Partners = styled.div`
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const PartnerItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 520px) {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }
`;

export const PartnerImage = styled.div`
  svg {
    display: block;
  }
`;

export const PartnerText = styled.div``;

export const PartnerSeparator = styled.div`
  font-size: 20px;
  font-weight: 400;
  line-height: 28px;
`;

export const Footer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;

  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: column;
    gap: 12px;
  }
`;

export const FooterText = styled.div`
  color: var(--lido-color-textSecondary);
  font-size: 10px;
  line-height: 16px;
  opacity: ${({ theme }) => (theme.name === 'dark' ? '0.5' : '1')};

  ${({ theme }) => theme.mediaQueries.md} {
    order: 2;
  }
`;

export const FooterAction = styled.div`
  ${({ theme }) => theme.mediaQueries.md} {
    order: 1;
    width: 100%;
  }
`;

export const Loader = styled(InlineLoader).attrs({
  color: 'text',
})`
  width: 40px;
`;
