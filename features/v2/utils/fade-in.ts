import { css } from 'styled-components';

export type FadeInProps = { $show: boolean };

export const fadeIn = css<FadeInProps>`
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transition: opacity var(--lido-app-ui-duration-base)
    var(--lido-app-ui-easing-out);
`;
