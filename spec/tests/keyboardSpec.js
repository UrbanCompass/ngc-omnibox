import {
  KEY,
  CODE_MAP,
  isModifierKey,
  isFunctionKey,
  isVerticalMovementKey,
  isHorizontalMovementKey,
  isSelectKey
} from '~/keyboard.js';

describe('ngcOmnibox.keyboard', () => {
  it('should have an object of key names', () => {
    expect(typeof KEY).toBe('object');
  });

  it('should have an object map for keycodes to key names', () => {
    expect(typeof CODE_MAP).toBe('object');
  });

  describe('when pressing a key', () => {
    let event;

    beforeEach(() => {
      event = {type: 'keypress'};
    });

    it('should detect if it was a modifier key', () => {
      expect(isModifierKey(event)).toBe(false);

      event.keyCode = KEY.COMMAND;
      expect(isModifierKey(event)).toBe(true);

      event.keyCode = KEY.TAB;
      expect(isModifierKey(event)).toBe(false);

      event.metaKey = true;
      expect(isModifierKey(event)).toBe(true);
    });

    it('should detect if it was one of the F keys', () => {
      expect(isFunctionKey()).toBe(false);

      // / Key
      expect(isFunctionKey(111)).toBe(false);

      // F1 Key
      expect(isFunctionKey(112)).toBe(true);

      // F12 Key
      expect(isFunctionKey(123)).toBe(true);

      // NUMLOCK Key
      expect(isFunctionKey(124)).toBe(false);
    });

    it('should detect if it would move the caret vertically', () => {
      expect(isVerticalMovementKey()).toBe(false);

      expect(isVerticalMovementKey(KEY.UP)).toBe(true);

      expect(isVerticalMovementKey(KEY.DOWN)).toBe(true);
    });

    it('should detect if it would move the caret horizontally', () => {
      expect(isHorizontalMovementKey()).toBe(false);

      expect(isHorizontalMovementKey(KEY.LEFT)).toBe(true);

      expect(isHorizontalMovementKey(KEY.RIGHT)).toBe(true);
    });

    it('should detect if it would commit a selection', () => {
      expect(isSelectKey()).toBe(false);

      expect(isSelectKey(KEY.ENTER)).toBe(true);

      expect(isSelectKey(KEY.TAB)).toBe(true);
    });
  });
});
