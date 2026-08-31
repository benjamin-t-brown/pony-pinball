import { getLib } from './lib.mjs';

// SDL2 Button Codes for emcc/gcc compiler
const BUTTON_LEFT = 1073741904;
const BUTTON_RIGHT = 1073741903;
const BUTTON_UP = 1073741906;
const BUTTON_DOWN = 1073741905;
const BUTTON_SHIFT = 1073742049; //225
const BUTTON_CTRL = 1073742048; //224
const BUTTON_ENTER = 13;
const BUTTON_SPACE = 32; //44
const BUTTON_X = 120; //27
const BUTTON_Z = 122; //29
const BUTTON_C = 99; //6

const BUTTON_LEFT_HTML = 'ArrowLeft';
const BUTTON_RIGHT_HTML = 'ArrowRight';
const BUTTON_UP_HTML = 'ArrowUp';
const BUTTON_DOWN_HTML = 'ArrowDown';
const BUTTON_SPACE_HTML = ' ';
const BUTTON_X_HTML = 'x';
const BUTTON_Z_HTML = 'z';
const BUTTON_C_HTML = 'c';
const BUTTON_SHIFT_HTML = 'shift';
const BUTTON_CTRL_HTML = 'ctrl';
const BUTTON_ENTER_HTML = 'enter';

let keyboardLayout = {};

const gamepadButtonsState = new Map();

export class LibInput {
  static getButtonCodes() {
    return {
      BUTTON_LEFT,
      BUTTON_RIGHT,
      BUTTON_UP,
      BUTTON_DOWN,
      BUTTON_SHIFT,
      BUTTON_CTRL,
      BUTTON_ENTER,
      BUTTON_SPACE,
      BUTTON_X,
      BUTTON_Z,
      BUTTON_C,
    };
  }

  static buttonCodeToHtmlButton = {
    [BUTTON_LEFT]: BUTTON_LEFT_HTML,
    [BUTTON_RIGHT]: BUTTON_RIGHT_HTML,
    [BUTTON_UP]: BUTTON_UP_HTML,
    [BUTTON_DOWN]: BUTTON_DOWN_HTML,
    [BUTTON_SPACE]: BUTTON_SPACE_HTML,
    [BUTTON_X]: BUTTON_X_HTML,
    [BUTTON_Z]: BUTTON_Z_HTML,
    [BUTTON_C]: BUTTON_C_HTML,
    [BUTTON_SHIFT]: BUTTON_SHIFT_HTML,
    [BUTTON_CTRL]: BUTTON_CTRL_HTML,
    [BUTTON_ENTER]: BUTTON_ENTER_HTML,
  };

  static htmlButtonToButtonCode = {
    [BUTTON_LEFT_HTML]: BUTTON_LEFT,
    [BUTTON_RIGHT_HTML]: BUTTON_RIGHT,
    [BUTTON_UP_HTML]: BUTTON_UP,
    [BUTTON_DOWN_HTML]: BUTTON_DOWN,
    [BUTTON_SPACE_HTML]: BUTTON_SPACE,
    [BUTTON_X_HTML]: BUTTON_X,
    [BUTTON_Z_HTML]: BUTTON_Z,
    [BUTTON_C_HTML]: BUTTON_C,
    [BUTTON_SHIFT_HTML]: BUTTON_SHIFT,
    [BUTTON_CTRL_HTML]: BUTTON_CTRL,
    [BUTTON_ENTER_HTML]: BUTTON_ENTER,
  };

  static setControlLayout(layout) {
    keyboardLayout = layout;
  }

  static getActionKey() {
    if (keyboardLayout.confirm) {
      if (keyboardLayout.confirm.label.includes('(X)')) {
        return {
          ...keyboardLayout.confirm,
          label: '(Space)',
        };
      } else {
        return keyboardLayout.confirm;
      }
    } else {
      return {
        key: [' ', 'x', 'X'],
        label: '(Space)',
      };
    }
  }

  static isActionKey(key) {
    return LibInput.getActionKey().key.includes(key);
  }

  static getConfirmKey() {
    return LibInput.getActionKey();
  }

  static isConfirmKey(key) {
    return LibInput.isActionKey(key);
  }

  static getCancelKey() {
    return (
      keyboardLayout.cancel || {
        key: ['z'],
        label: '(Z)',
      }
    );
  }

  static isCancelKey(key) {
    return LibInput.getCancelKey().key.includes(key);
  }

  static getAuxKey() {
    if (keyboardLayout.shift) {
      if (keyboardLayout.shift.label.includes('(X)')) {
        return {
          ...keyboardLayout.shift,
          label: '(Shift)',
        };
      } else {
        return keyboardLayout.shift;
      }
    } else {
      return {
        key: ['Shift'],
        label: '(Shift)',
      };
    }
  }

  static isAuxKey(key) {
    return LibInput.getAuxKey().key.includes(key);
  }

  static getUpKey() {
    return {
      key: ['ArrowUp'],
      label: '(Up)',
    };
  }

  static isUpKey(key) {
    return ['ArrowUp'].includes(key);
  }

  static getDownKey() {
    return (
      keyboardLayout.down || {
        key: ['ArrowDown'],
        label: '(Dn)',
      }
    );
  }

  static isDownKey(key) {
    return LibInput.getDownKey().key.includes(key);
  }

  static getLeftKey() {
    return (
      keyboardLayout.left || {
        key: ['ArrowLeft'],
        label: '(Left)',
      }
    );
  }

  static isLeftKey(key) {
    return LibInput.getLeftKey().key.includes(key);
  }

  static getRightKey() {
    return (
      keyboardLayout.right || {
        key: ['ArrowRight'],
        label: '(Right)',
      }
    );
  }

  static isRightKey(key) {
    return LibInput.getRightKey().key.includes(key);
  }

  static getSkipKey() {
    return (
      keyboardLayout.skip || {
        key: ['Backspace', 'Escape'],
        label: '(Backspace)',
      }
    );
  }

  static isSkipKey(key) {
    return LibInput.getSkipKey().key.includes(key);
  }

  static getEscapeKey() {
    return (
      keyboardLayout.escape || {
        key: ['Escape'],
        label: '(Esc)',
      }
    );
  }

  static isEscapeKey(key) {
    return ['Escape'].includes(key);
  }

  static simulateKeyPress(buttonIndex, isDown) {
    const gamepadButtonIndexToKey = {
      0: 'x',
      1: 'z',
      2: 'c',
      3: 'y',
      4: 'left bumper',
      5: 'right bumper',
      6: 'shift',
      7: 'right trigger',
      8: 'Backspace',
      9: 'Escape',
      10: 'left stick',
      11: 'right stick',
      12: 'ArrowUp',
      13: 'ArrowDown',
      14: 'ArrowLeft',
      15: 'ArrowRight',
      16: 'home',
    };
    const gamepadButtonToLibKey = {
      0: BUTTON_SPACE,
      1: BUTTON_SHIFT,
      2: BUTTON_UP,
      3: BUTTON_C,
      4: BUTTON_CTRL,
      5: BUTTON_Z,
      6: BUTTON_X,
      7: 'right trigger',
      8: 'Backspace',
      9: 'Escape',
      10: 'left stick',
      11: 'right stick',
      12: BUTTON_UP,
      13: BUTTON_DOWN,
      14: BUTTON_LEFT,
      15: BUTTON_RIGHT,
      16: BUTTON_ENTER,
    };

    const key = gamepadButtonIndexToKey[buttonIndex];
    if (!key) {
      return;
    }

    const simulatedEvent = new KeyboardEvent(isDown ? 'keydown' : 'keyup', {
      key,
    });
    window.dispatchEvent(simulatedEvent);
    if (isDown) {
      getLib().handleButtonDown(
        gamepadButtonToLibKey[buttonIndex],
        simulatedEvent
      );
    } else {
      getLib().handleButtonUp(gamepadButtonToLibKey[buttonIndex]);
    }
  }

  static startGamepadInterval(lib) {
    const gamepadInterval = setInterval(() => {
      if (lib.getConfig().gameStarted || !lib.getConfig().isArcadeCabinet) {
        for (const gamepad of navigator.getGamepads()) {
          if (!gamepad) {
            continue;
          }
          updateGamePad(gamepad);
        }
      }
    }, 16);
    return gamepadInterval;
  }

  /**
   * Creates and inserts the on-screen control elements into the DOM.
   *
   * @param {string} dpadLayout - D-pad layout key ('normal', 'lr', 'centeredlaf', 'none').
   * @param {string} buttonsLayout - Buttons layout key ('a', 'ab', 'abshift').
   * @returns {void}
   */
  static createOnScreenControls(
    dpadLayout /** @type {string} */, 
    buttonsLayout /** @type {string} */
  ) {
    // D-pad layout: 'centeredlaf' (centered LR Action) - special case
    if (dpadLayout === 'centeredlaf') {
      const scaffoldHtml = `
    <div class="scaffold-outer">
      <div id="scaffold-controls-bottom" style="justify-content: center;">
        <div class="scaffold-controls">${controlsCenteredLrAction}
          <div class="scaffold-vertical-spacer"></div>
        </div>
      </div>
    </div>
    `;
      const game = document.getElementById('controls');
      if (game) {
        game.innerHTML = scaffoldHtml;
      } else {
        console.error('Could not find "#controls" element to append scaffold.');
      }
      return;
    }

    // D-pad layout: 'none' - show no D-pad, only buttons (if any)
    if (dpadLayout === 'none') {
      /** @type {{[key: string]: string}} */
      const buttonsMap = {
        a: controlsButtonsA,
        ab: controlsButtonsAb,
        abshift: controlsButtonsAbShift,
      };
      if (!buttonsMap[buttonsLayout]) {
        console.error(
          `[LIB] Invalid buttons layout "${buttonsLayout}", using "ab" instead.`
        );
        buttonsLayout = 'ab';
      }
      const controlsButtons = buttonsMap[buttonsLayout];
      const scaffoldHtml = `
    <div class="scaffold-outer">
      <div id="scaffold-controls-bottom">
        <div class="scaffold-controls">${controlsButtons}
          <div class="scaffold-vertical-spacer"></div>
        </div>
      </div>
    </div>
      `;
      const game = document.getElementById('controls');
      if (game) {
        game.innerHTML = scaffoldHtml;
      } else {
        console.error('Could not find "#controls" element to append scaffold.');
      }
      return;
    }

    /** @type {{[key: string]: string}} */
    const dpadMap = {
      normal: controlsDpadNormal,
      lr: controlsDpadLr,
    };
    /** @type {{[key: string]: string}} */
    const buttonsMap = {
      a: controlsButtonsA,
      ab: controlsButtonsAb,
      abshift: controlsButtonsAbShift,
    };
    if (!buttonsMap[buttonsLayout]) {
      console.error(
        `[LIB] Invalid buttons layout "${buttonsLayout}", using "ab" instead.`
      );
      buttonsLayout = 'ab';
    }
    if (!dpadMap[dpadLayout]) {
      console.error(
        `[LIB] Invalid dpad layout "${dpadLayout}", using "normal" instead.`
      );
      dpadLayout = 'normal';
    }
    const controlsDpad = dpadMap[dpadLayout];
    const controlsButtons = buttonsMap[buttonsLayout];

    const scaffoldHtml = `
  <div class="scaffold-outer">
    <div id="scaffold-controls-bottom">
      <div class="scaffold-controls">
        ${controlsDpad}
        <div class="scaffold-vertical-spacer"></div>
      </div>
      <div class="scaffold-controls">${controlsButtons}
      <div class="scaffold-vertical-spacer"></div>
    </div>
  </div>
  `;
    const game = document.getElementById('controls');
    if (game) {
      game.innerHTML = scaffoldHtml;
    } else {
      console.error('Could not find "#controls" element to append scaffold.');
    }
  }
}

const getAxisButtonPress = (axisValue, button1I, button2I) => {
  if (axisValue < -0.75) {
    return button1I;
  } else if (axisValue > 0.75) {
    return button2I;
  }
  return null;
};

const updateGamePad = gamepad => {
  const buttonsToUnpress = [];
  const buttonsToSkipUnpress = [];
  for (const [i, button] of gamepad.buttons.entries()) {
    const pctPressed = button.value * 100;
    if (button.pressed && pctPressed > 50) {
      buttonsToSkipUnpress.push(i);
      if (!gamepadButtonsState.get(i)) {
        gamepadButtonsState.set(i, true);
        LibInput.simulateKeyPress(i, true);
      }
    } else {
      buttonsToUnpress.push(i);
    }
  }

  for (const [i, axisValue] of gamepad.axes.entries()) {
    let localButtonsToUnpress = [];
    // left stick x
    if (i === 0) {
      const leftButtonI = 14;
      const rightButtonI = 15;

      const buttonI = getAxisButtonPress(axisValue, leftButtonI, rightButtonI);
      if (buttonI !== null) {
        if (!gamepadButtonsState.get(buttonI)) {
          gamepadButtonsState.set(buttonI, true);
          LibInput.simulateKeyPress(buttonI, true);
        }
        buttonsToSkipUnpress.push(buttonI);
        localButtonsToUnpress.push(
          buttonI === leftButtonI ? rightButtonI : leftButtonI
        );
      } else if (buttonI === null) {
        localButtonsToUnpress.push(leftButtonI);
        localButtonsToUnpress.push(rightButtonI);
      }
    }
    // left stick y
    if (i === 1) {
      const upButtonI = 12;
      const downButtonI = 13;

      const buttonI = getAxisButtonPress(axisValue, upButtonI, downButtonI);
      if (buttonI !== null) {
        if (!gamepadButtonsState.get(buttonI)) {
          gamepadButtonsState.set(buttonI, true);
          LibInput.simulateKeyPress(buttonI, true);
        }
        buttonsToSkipUnpress.push(buttonI);
        localButtonsToUnpress.push(
          buttonI === upButtonI ? downButtonI : upButtonI
        );
      } else if (buttonI === null) {
        localButtonsToUnpress.push(upButtonI);
        localButtonsToUnpress.push(downButtonI);
      }
    }
    for (const j of localButtonsToUnpress) {
      if (gamepadButtonsState.get(i)) {
        buttonsToUnpress.push(j);
      }
    }
  }

  for (const i of buttonsToUnpress) {
    if (buttonsToSkipUnpress.includes(i)) {
      continue;
    }
    if (gamepadButtonsState.get(i)) {
      // button was released
      gamepadButtonsState.set(i, false);
      LibInput.simulateKeyPress(i, false);
    }
  }
};

const bc = () => LibInput.getButtonCodes();

const buttonCallbackStrings = {
  Up: {
    down: `Lib.handleButtonDown(${bc().BUTTON_UP})`,
    up: `Lib.handleButtonUp(${bc().BUTTON_UP})`,
  },
  Down: {
    down: `Lib.handleButtonDown(${bc().BUTTON_DOWN})`,
    up: `Lib.handleButtonUp(${bc().BUTTON_DOWN})`,
  },
  Left: {
    down: `Lib.handleButtonDown(${bc().BUTTON_LEFT})`,
    up: `Lib.handleButtonUp(${bc().BUTTON_LEFT})`,
  },
  Right: {
    down: `Lib.handleButtonDown(${bc().BUTTON_RIGHT})`,
    up: `Lib.handleButtonUp(${bc().BUTTON_RIGHT})`,
  },
  Confirm: {
    down: `Lib.handleButtonDown(${bc().BUTTON_SPACE})`,
    up: `Lib.handleButtonUp(${bc().BUTTON_SPACE})`,
  },
  Cancel: {
    down: `Lib.handleButtonDown(${bc().BUTTON_Z})`,
    up: `Lib.handleButtonUp(${bc().BUTTON_Z})`,
  },
  Shift: {
    down: `Lib.handleButtonDown(${bc().BUTTON_SHIFT})`,
    up: `Lib.handleButtonUp(${bc().BUTTON_SHIFT})`,
  },
  Ctrl: {
    down: `Lib.handleButtonDown(${bc().BUTTON_CTRL})`,
    up: `Lib.handleButtonUp(${bc().BUTTON_CTRL})`,
  },
};

const controlsDpadNormal = `
<div class="scaffold-dpad">
  <div class="scaffold-flex-row-center">
    <button class="scaffold-button scaffold-button-direction"
      onmousedown="${buttonCallbackStrings.Up.down}"
      ontouchstart="${buttonCallbackStrings.Up.down}"
      onmouseup="${buttonCallbackStrings.Up.up}"
      ontouchend="${buttonCallbackStrings.Up.up}"
      >↑</button>
  </div>
  <div class="scaffold-flex-row-space-between">
    <button class="scaffold-button scaffold-button-direction"
      onmousedown="${buttonCallbackStrings.Left.down}"
      ontouchstart="${buttonCallbackStrings.Left.down}"
      onmouseup="${buttonCallbackStrings.Left.up}"
      ontouchend="${buttonCallbackStrings.Left.up}"
      >←</button>
    <button class="scaffold-button scaffold-button-direction"
      onmousedown="${buttonCallbackStrings.Right.down}"
      ontouchstart="${buttonCallbackStrings.Right.down}"
      onmouseup="${buttonCallbackStrings.Right.up}"
      ontouchend="${buttonCallbackStrings.Right.up}"
      >→</button>  
  </div>
  <div class="scaffold-flex-row-center">
    <button class="scaffold-button scaffold-button-direction"
      onmousedown="${buttonCallbackStrings.Down.down}"
      ontouchstart="${buttonCallbackStrings.Down.down}"
      onmouseup="${buttonCallbackStrings.Down.up}"
      ontouchend="${buttonCallbackStrings.Down.up}"
      >↓</button>
  </div>
</div>
`;

const controlsDpadLr = `
<div class="scaffold-dpad">
  <div class="scaffold-flex-row-space-between">
    <button class="scaffold-button scaffold-button-direction"
      onmousedown="${buttonCallbackStrings.Left.down}"
      ontouchstart="${buttonCallbackStrings.Left.down}"
      onmouseup="${buttonCallbackStrings.Left.up}"
      ontouchend="${buttonCallbackStrings.Left.up}"
      >←</button>
    <button class="scaffold-button scaffold-button-direction"
      onmousedown="${buttonCallbackStrings.Right.down}"
      ontouchstart="${buttonCallbackStrings.Right.down}"
      onmouseup="${buttonCallbackStrings.Right.up}"
      ontouchend="${buttonCallbackStrings.Right.up}"
      >→</button>  
  </div>
</div>
`;

const controlsButtonsA = `
<div class="scaffold-buttons">
  <div class="scaffold-flex-row-flex-end">
    <button class="scaffold-button scaffold-button-confirm"
      onmousedown="${buttonCallbackStrings.Confirm.down}"
      ontouchstart="${buttonCallbackStrings.Confirm.down}"
      onmouseup="${buttonCallbackStrings.Confirm.up}"
      ontouchend="${buttonCallbackStrings.Confirm.up}"
      >X</button>
  </div>
</div>
`;

const controlsButtonsAb = `
<div class="scaffold-buttons">
  <div class="scaffold-flex-row-flex-end">
    <button class="scaffold-button scaffold-button-confirm"
      onmousedown="${buttonCallbackStrings.Confirm.down}"
      ontouchstart="${buttonCallbackStrings.Confirm.down}"
      onmouseup="${buttonCallbackStrings.Confirm.up}"
      ontouchend="${buttonCallbackStrings.Confirm.up}"
      >X</button>
  </div>
  <div class="scaffold-flex-row-center">
    <button class="scaffold-button scaffold-button-cancel"
      onmousedown="${buttonCallbackStrings.Cancel.down}"
      ontouchstart="${buttonCallbackStrings.Cancel.down}"
      onmouseup="${buttonCallbackStrings.Cancel.up}"
      ontouchend="${buttonCallbackStrings.Cancel.up}"
      >Z</button>
  </div>
</div>
`;

const controlsButtonsAbShift = `
<div class="scaffold-buttons">
  <div class="scaffold-flex-row-center">

  </div>
  <div class="scaffold-flex-row-space-between">
    <button class="scaffold-button scaffold-button-shift"
      onmousedown="${buttonCallbackStrings.Shift.down}"
      ontouchstart="${buttonCallbackStrings.Shift.down}"
      onmouseup="${buttonCallbackStrings.Shift.up}"
      ontouchend="${buttonCallbackStrings.Shift.up}"
      >SHIFT</button>
    <button class="scaffold-button scaffold-button-confirm"
      onmousedown="${buttonCallbackStrings.Confirm.down}"
      ontouchstart="${buttonCallbackStrings.Confirm.down}"
      onmouseup="${buttonCallbackStrings.Confirm.up}"
      ontouchend="${buttonCallbackStrings.Confirm.up}"
      >X</button>
  </div>
  <div class="scaffold-flex-row-center">
    <button class="scaffold-button scaffold-button-cancel"
      onmousedown="${buttonCallbackStrings.Cancel.down}"
      ontouchstart="${buttonCallbackStrings.Cancel.down}"
      onmouseup="${buttonCallbackStrings.Cancel.up}"
      ontouchend="${buttonCallbackStrings.Cancel.up}"
      >Z</button>
  </div>
</div>
`;

const controlsCenteredLrAction = `
<div class="scaffold-buttons">
  <div class="scaffold-flex-row-space-between">
    <button class="scaffold-button scaffold-button-direction"
      onmousedown="${buttonCallbackStrings.Left.down}"
      ontouchstart="${buttonCallbackStrings.Left.down}"
      onmouseup="${buttonCallbackStrings.Left.up}"
      ontouchend="${buttonCallbackStrings.Left.up}"
      >←</button>
    <button class="scaffold-button scaffold-button-confirm"
      onmousedown="${buttonCallbackStrings.Confirm.down}"
      ontouchstart="${buttonCallbackStrings.Confirm.down}"
      onmouseup="${buttonCallbackStrings.Confirm.up}"
      ontouchend="${buttonCallbackStrings.Confirm.up}"
      >X</button>
    <button class="scaffold-button scaffold-button-direction"
      onmousedown="${buttonCallbackStrings.Right.down}"
      ontouchstart="${buttonCallbackStrings.Right.down}"
      onmouseup="${buttonCallbackStrings.Right.up}"
      ontouchend="${buttonCallbackStrings.Right.up}"
      >→</button>
  </div>
</div>
`;
