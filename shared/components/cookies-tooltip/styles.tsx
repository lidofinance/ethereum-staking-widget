import styled from 'styled-components';

const ExternalLink = styled.a.attrs({
  target: '_blank',
  rel: 'nofollow noopener',
})`
  cursor: pointer;
`;

export const Wrap = styled.div`
  z-index: 999;
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ theme }) => theme.mediaQueries.lg} {
    bottom: 0;
    left: 0;
    right: 0;
  }
`;

export const Box = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-radius: 20px;
  background-color: var(--lido-color-foreground);
  box-shadow: 0 6px 32px rgba(0, 0, 0, 0.08);

  ${({ theme }) => theme.mediaQueries.lg} {
    flex-direction: column;
    border-radius: 0;
    width: 100%;
  }
`;

export const CookieWrap = styled.div`
  margin-right: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;

  ${({ theme }) => theme.mediaQueries.lg} {
    display: none;
  }
`;

export const Text = styled.div`
  margin-right: 8px;
  font-weight: 500;
  font-size: 14px;
  line-height: 22px;
  color: var(--lido-color-textSecondary);
  width: 340px;

  ${({ theme }) => theme.mediaQueries.lg} {
    margin-right: 0;
    margin-bottom: 8px;
    width: 100%;
    text-align: center;
  }
`;

export const ButtonsWrap = styled.div`
  display: flex;
`;

const ButtonBasic = styled.button.attrs({ type: 'button' })`
  font-weight: 800;
  font-size: 12px;
  line-height: 20px;
  border-radius: 6px;
  width: 72px;
  height: 32px;
  border: none;
  outline: none;
  cursor: pointer;
  transition: background-color ease 0.25s, border-color ease 0.25s,
    color ease 0.25s;

  &:not(:last-child) {
    margin-right: 8px;
  }

  &:hover {
    background-color: #0e1621;
  }

  &:active {
    transform: translateY(1px);
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    width: 112px;
  }
`;

export const AllowButton = styled((props) => <ButtonBasic {...props} />)`
  background-color: var(--lido-color-text);
  color: var(--lido-color-foreground);

  &:hover {
    background-color: var(--lido-color-textSecondary);
  }
`;

export const DeclineButton = styled((props) => <ButtonBasic {...props} />)`
  background-color: var(--lido-color-foreground);
  color: var(--lido-color-text);
  border: 1px solid var(--lido-color-text);

  &:hover {
    background-color: var(--lido-color-background);
  }
`;

export const Link = styled((props) => <ExternalLink {...props} />)`
  color: inherit;
  text-decoration: underline !important;
`;
