// Migrated from styled-components to CSS modules (pilot of the exit plan):
// exports keep their names and consumer contract; styling lives in
// styles.module.css.
import { styledElement } from 'styles/styled-element';

import styles from './styles.module.css';

export const SettingsFormWrap = styledElement(
  'div',
  styles.settingsFormWrap,
  'SettingsFormWrap',
);

export const Actions = styledElement('div', styles.actions, 'Actions');

export const DescriptionText = styledElement(
  'div',
  styles.descriptionText,
  'DescriptionText',
);

export const DescriptionTitle = styledElement(
  'div',
  styles.descriptionTitle,
  'DescriptionTitle',
);
