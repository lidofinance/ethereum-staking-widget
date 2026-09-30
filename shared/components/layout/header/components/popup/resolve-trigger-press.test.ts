import { resolveTriggerPress } from './resolve-trigger-press';

describe('resolveTriggerPress', () => {
  describe('link mode', () => {
    const press = (
      pointerType: string | undefined,
      { isKeyboard = false, canOpen = true } = {},
    ) =>
      resolveTriggerPress({ mode: 'link', pointerType, isKeyboard, canOpen });

    it('follows the link on mouse click', () => {
      expect(press('mouse')).toBe('follow');
    });

    it('toggles the menu on touch and pen', () => {
      expect(press('touch')).toBe('toggle');
      expect(press('pen')).toBe('toggle');
    });

    it('follows the link on keyboard activation', () => {
      expect(press(undefined, { isKeyboard: true })).toBe('follow');
      expect(press('touch', { isKeyboard: true })).toBe('follow');
    });

    it('follows the link when pointer type is unknown', () => {
      expect(press(undefined)).toBe('follow');
    });

    it('follows the link on touch when menu cannot open', () => {
      expect(press('touch', { canOpen: false })).toBe('follow');
    });
  });

  describe('button mode', () => {
    const press = (
      pointerType: string | undefined,
      { isKeyboard = false, canOpen = true } = {},
    ) =>
      resolveTriggerPress({ mode: 'button', pointerType, isKeyboard, canOpen });

    it('toggles the menu on any press', () => {
      expect(press('mouse')).toBe('toggle');
      expect(press('touch')).toBe('toggle');
      expect(press(undefined, { isKeyboard: true })).toBe('toggle');
    });

    it('ignores presses when menu cannot open', () => {
      expect(press('mouse', { canOpen: false })).toBe('ignore');
    });
  });
});
