// 'link': mouse and keyboard follow the link, touch toggles the menu
// 'button': every press toggles the menu
export type PopupTriggerMode = 'link' | 'button';

export type TriggerPressAction = 'follow' | 'toggle' | 'ignore';

type TriggerPress = {
  mode: PopupTriggerMode;
  // pointerType of the last pointerdown, undefined when there was none
  pointerType: string | undefined;
  isKeyboard: boolean;
  canOpen: boolean;
};

export const resolveTriggerPress = ({
  mode,
  pointerType,
  isKeyboard,
  canOpen,
}: TriggerPress): TriggerPressAction => {
  if (mode === 'button') return canOpen ? 'toggle' : 'ignore';
  if (!canOpen || isKeyboard) return 'follow';
  return pointerType === 'touch' || pointerType === 'pen' ? 'toggle' : 'follow';
};
