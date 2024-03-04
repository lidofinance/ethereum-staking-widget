import styled, { css } from 'styled-components';
import { Button, Link } from '@lidofinance/lido-ui';
import Icons from 'assets/icons/l2-swap.svg';
import { LocalLink } from 'shared/components/local-link';

export const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: ${({ theme }) => theme.spaceMap.lg}px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  gap: 10px;
  overflow: hidden;
  background: radial-gradient(
      100% 1200% at 120% 110%,
      rgba(255, 255, 255, 0.95) 2%,
      rgba(219, 255, 255, 0.95) 35%,
      rgba(255, 255, 255, 0) 100%
    ),
    linear-gradient(130deg, #a6a5ff 7%, rgba(181, 180, 255, 0) 55%);
  box-sizing: border-box;

  ${({ theme }) => theme.mediaQueries.md} {
    gap: 6px;
    padding: ${({ theme }) => theme.spaceMap.md}px;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    cursor: pointer;
    padding: ${({ theme }) => theme.spaceMap.sm}px;
  }
`;

export const L2Icons = styled.img.attrs({
  src: Icons,
  alt: '',
})`
  display: block;
  width: 188px;
  height: 32px;
`;

export const FooterWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const TextHeader = styled.div`
  margin-bottom: 4px;
  font-size: 14px;
  line-height: 16px;
  font-weight: 700;
  color: var(--lido-color-textDark);
`;

export const TextWrap = styled.div`
  flex: 1 1 auto;
  color: var(--lido-color-textDark);
  line-height: 20px;
  font-size: 12px;
  font-weight: 400;
  position: relative;
`;

const buttonLinkWrapCss = css`
  display: block;

  ${({ theme }) => theme.mediaQueries.md} {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
`;

export const ButtonLinkWrap = styled(Link)`
  ${buttonLinkWrapCss};
`;

export const ButtonLinkWrapLocal = styled(LocalLink)`
  ${buttonLinkWrapCss};
`;

export const ButtonStyle = styled(Button)`
  padding: 7px 16px;
  font-size: 12px;
  line-height: 20px;

  ${({ theme }) => theme.mediaQueries.md} {
    display: none;
  }
`;
