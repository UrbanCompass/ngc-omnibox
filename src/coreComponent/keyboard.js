/**
 * Returns a keycode from a human readable representation of a keyboard key.
 *
 * @type {Object}
 */
export const KEY = {
  TAB: 9,
  ENTER: 13,
  ESC: 27,
  SPACE: 32,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  HOME: 36,
  END: 35,
  BACKSPACE: 8,
  DELETE: 46,
  COMMAND: 91
};

/**
 * Maps keycodes to a human readable string representation of a keyboard key.
 *
 * @type {Object}
 */
export const CODE_MAP = {
  91: 'COMMAND',
  8: 'BACKSPACE',
  9: 'TAB',
  13: 'ENTER',
  16: 'SHIFT',
  17: 'CTRL',
  18: 'ALT',
  19: 'PAUSEBREAK',
  20: 'CAPSLOCK',
  27: 'ESC',
  32: 'SPACE',
  33: 'PAGE_UP',
  34: 'PAGE_DOWN',
  35: 'END',
  36: 'HOME',
  37: 'LEFT',
  38: 'UP',
  39: 'RIGHT',
  40: 'DOWN',
  43: '+',
  44: 'PRINTSCREEN',
  45: 'INSERT',
  46: 'DELETE',
  48: '0',
  49: '1',
  50: '2',
  51: '3',
  52: '4',
  53: '5',
  54: '6',
  55: '7',
  56: '8',
  57: '9',
  59: ';',
  61: '=',
  65: 'A',
  66: 'B',
  67: 'C',
  68: 'D',
  69: 'E',
  70: 'F',
  71: 'G',
  72: 'H',
  73: 'I',
  74: 'J',
  75: 'K',
  76: 'L',
  77: 'M',
  78: 'N',
  79: 'O',
  80: 'P',
  81: 'Q',
  82: 'R',
  83: 'S',
  84: 'T',
  85: 'U',
  86: 'V',
  87: 'W',
  88: 'X',
  89: 'Y',
  90: 'Z',
  96: '0',
  97: '1',
  98: '2',
  99: '3',
  100: '4',
  101: '5',
  102: '6',
  103: '7',
  104: '8',
  105: '9',
  106: '*',
  107: '+',
  109: '-',
  110: '.',
  111: '/',
  112: 'F1',
  113: 'F2',
  114: 'F3',
  115: 'F4',
  116: 'F5',
  117: 'F6',
  118: 'F7',
  119: 'F8',
  120: 'F9',
  121: 'F10',
  122: 'F11',
  123: 'F12',
  144: 'NUMLOCK',
  145: 'SCROLLLOCK',
  186: ';',
  187: '=',
  188: ',',
  189: '-',
  190: '.',
  191: '/',
  192: '`',
  219: '[',
  220: '\\',
  221: ']',
  222: '\''
};

/**
 * Returns if the key is a modifier key. Takes into account differences between multiple Operating
 * System default key configurations.
 *
 * @param {Event} event
 * @returns {Boolean}
 */
export function isModifierKey(event) {
  const keyCode = event.which;

  switch (keyCode) {
    case KEY.COMMAND:
    case KEY.SHIFT:
    case KEY.CTRL:
    case KEY.ALT:
      return true;
  }

  if (event.metaKey || event.ctrlKey || event.altKey) {
    return true;
  }

  return false;
}

/**
 * Returns if the key is one of the Function row keys (F1-F15)
 *
 * @param {Number} keyCode
 * @returns {Boolean}
 */
export function isFunctionKey(keyCode) {
  keyCode = keyCode.which ? keyCode.which : keyCode;
  return keyCode >= 112 && keyCode <= 123;
}

/**
 * Returns true if pressing the key would move the caret vertically.
 *
 * @param {Number} keyCode
 * @returns {Boolean}
 */
export function isVerticalMovementKey(keyCode) {
  switch (keyCode) {
    case KEY.UP:
    case KEY.DOWN:
      return true;
  }

  return false;
}

/**
 * Returns true if pressing the key would move the caret horizontally.
 *
 * @param {Number} keyCode
 * @returns {Boolean}
 */
export function isHorizontalMovementKey(keyCode) {
  switch (keyCode) {
    case KEY.LEFT:
    case KEY.RIGHT:
    case KEY.TAB:
      return true;
  }

  return false;
}

/**
 * Returns true if pressing this key should select a highlighted item.
 *
 * @param {Number} keyCode
 * @returns {Boolean}
 */
export function isSelectKey(keyCode) {
  switch (keyCode) {
    case KEY.ENTER:
    case KEY.TAB:
      return true;
  }

  return false;
}
