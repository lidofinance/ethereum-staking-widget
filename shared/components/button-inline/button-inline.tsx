import styled from 'styled-components';

export const ButtonInline = styled.button.attrs({ type: 'button' })`
  appearance: none;
  background: none;
  border: 0;
  margin: 0;
  padding: 0;

  font: inherit;
  font-size: 12px;
  color: var(--lido-color-primary);

  cursor: pointer;
  text-decoration: none;
  text-underline-offset: 2px;

  &:hover {
    color: var(--lido-color-primaryHover);
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
    border-radius: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    text-decoration: none;
  }
`;
