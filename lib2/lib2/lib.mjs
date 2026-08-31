import { LibInput } from './input.mjs';
import { SoundPlayer } from './sound.mjs';
import { persistSoundEnabled } from './storage.mjs';
import { getElementById, getCanvas } from './utils.mjs';

export class Lib {
  keyboardLayout = {};
  subscriptions = {
    onButtonDown: [],
    onButtonUp: [],
    onToggleModuleControls: [],
    onToggleSound: [],
    onSetVolume: [],
  };
  config = {
    gameStarted: false,
    soundEnabled: true,
    disableInput: false,
    isArcadeCabinet: false,
    language: 'en',
    targetWidth: 640, // reset by notifyTargetWindowSize
    targetHeight: 480, // reset by notifyTargetWindowSize
    showControls: true,
    tapToStart: false,
    start: (...args) => {},
    end: (...args) => {},
  };
  input = LibInput;
  soundPlayer = new SoundPlayer();

  /** @type {HTMLCanvasElement|null} */
  canvas = null;
  setConfig(config = {}) {
    this.config = {
      ...this.config,
      ...config,
    };
  }
  getConfig() {
    return this.config;
  }

  getCanvas() {
    if (!this.canvas) {
      this.canvas = /** @type {HTMLCanvasElement} */ (getCanvas());
    }
    return this.canvas;
  }

  hideLoading() {
    getElementById('loading').style.display = 'none';
  }

  showError() {
    getElementById('loading').style.display = 'none';
  }

  showGame() {
    getElementById('game').style.display = 'flex';
  }

  hideGame() {
    getElementById('game').style.display = 'none';
  }

  showControls() {
    getElementById('controls').style.display = 'block';
    this.config.showControls = true;
  }

  hideControls() {
    getElementById('controls').style.display = 'none';
    this.config.showControls = false;
  }

  showMenu() {
    getElementById('top-bar').style.display = 'flex';
  }

  hideMenu() {
    getElementById('top-bar').style.display = 'none';
    const elem = /** @type {HTMLElement} */ (
      document.getElementsByClassName('game-outer-yes-controls')[0]
    );
    if (elem) {
      elem.style.top = 'unset';
      elem.style.height = '100%';
    }
  }

  modulePostRunFromJs() {
    window.Module.jsLoaded();
    window.Module.postRun[0]();
    if (this.getConfig().isArcadeCabinet) {
      this.disableModuleControls();
    }
  }

  setupKeyboardEvents() {
    window.addEventListener('keydown', event => {
      this.handleButtonDown(LibInput.htmlButtonToButtonCode[event.key], event);
    });
    window.addEventListener('keyup', event => {
      this.handleButtonUp(LibInput.htmlButtonToButtonCode[event.key]);
    });
  }

  disableModuleControls() {
    /** @type {any} */
    const localWindow = window;
    localWindow.Module.ccall('setKeyStatus', 'void', ['number'], [0]);
    this.invokeEvent('onToggleModuleControls', false);
    this.config.disableInput = true;
  }

  enableModuleControls() {
    /** @type {any} */
    const localWindow = window;
    localWindow.Module.ccall('setKeyStatus', 'void', ['number'], [1]);
    this.invokeEvent('onToggleModuleControls', true);
    this.config.disableInput = false;
  }

  toggleSound() {
    /** @type {any} */
    const localWindow = window;
    if (this.config.soundEnabled) {
      localWindow.Module.ccall('disableSound');
    } else {
      localWindow.Module.ccall('enableSound');
    }
    this.config.soundEnabled = !this.config.soundEnabled;
    persistSoundEnabled(this.config.soundEnabled);
    this.invokeEvent('onToggleSound', this.config.soundEnabled);
  }

  setWASMVolume(pct) {
    /** @type {any} */
    const localWindow = window;
    if (isNaN(pct)) {
      pct = 33;
    }
    localWindow.Module.ccall('setVolume', 'void', ['number'], [pct]);
    this.invokeEvent('onSetVolume', pct);
  }

  setVolume(pct) {
    this.soundPlayer.setVolume(pct);
    this.invokeEvent('onSetVolume', pct);
  }

  setControlLayout = function (layout) {
    this.keyboardLayout = layout;
  };

  handleButtonDown(key, event) {
    /** @type {any} */
    const localWindow = window;
    if (this.config.disableInput) {
      return;
    }
    if (event) {
      event.preventDefault();
    }
    localWindow.Module.ccall('setKeyDown', 'void', ['number'], [key]);
    this.invokeEvent('onButtonDown', key);
  }

  handleButtonUp(key) {
    /** @type {any} */
    const localWindow = window;
    if (this.config.disableInput) {
      return;
    }
    if (window.event) {
      window.event.preventDefault();
    }
    localWindow.Module.ccall('setKeyUp', 'void', ['number'], [key]);
    this.invokeEvent('onButtonUp', key);
  }

  sendEvent(event, payload) {
    /** @type {any} */
    const localWindow = window;
    localWindow.Module.ccall(
      'sendEvent',
      'void',
      ['number', 'string'],
      [event, String(payload)]
    );
  }

  notifyParentFrame(action, payload) {
    if (window.parent) {
      console.log('[lib2] notify parent', action, payload);
      window.parent.postMessage(
        JSON.stringify({
          action,
          payload,
        }),
        '*'
      );
    }
  }

  notifyTargetWindowSize(w, h) {
    this.config.targetWidth = w;
    this.config.targetHeight = h;
    this.getCanvas().width = w;
    this.getCanvas().height = h;
    this.notifyParentFrame('TARGET_WINDOW_SIZE', { w, h });
  }

  notifyGameReady() {
    // wait just a bit to show the game so the audio doesn't glitch out (like it does for some reason for wasm stuff that has debug on)
    this.setWASMVolume(33);
    // if (this.config.autoPushStart) {
    //   setTimeout(() => {
    //     this.handleButtonDown(getButtonCodes().BUTTON_ENTER);
    //     this.handleButtonUp(getButtonCodes().BUTTON_ENTER);
    //   }, 500);
    // }
    this.notifyParentFrame('GAME_READY', {});
  }

  notifyGameStarted() {
    this.notifyParentFrame('GAME_STARTED', {});
    this.config.gameStarted = true;
  }

  notifyGameCompleted(result) {
    this.notifyParentFrame('GAME_CONCLUDED', result);
    this.config.gameStarted = false;
  }

  notifyGameGeneric(payload) {
    this.notifyParentFrame('GAME_GENERIC', payload);
  }

  notifyGameCancelled() {
    this.notifyParentFrame('GAME_CANCELLED', {});
    this.config.gameStarted = false;
  }

  notifyRPGScript(scriptSrc) {
    this.notifyParentFrame('RUN_RPGSCRIPT', {
      scriptSrc,
    });
  }

  notifyGameCustom(args) {
    this.notifyParentFrame('GAME_CUSTOM', args);
  }

  notifyEscapePressed() {
    this.notifyParentFrame('ESCAPE_PRESSED', {});
  }

  notifyEscapeUnpressed() {
    this.notifyParentFrame('ESCAPE_UNPRESSED', {});
  }

  subscribe(eventName, callback) {
    if (this.subscriptions[eventName]) {
      this.subscriptions[eventName].push(callback);
    }
  }

  unsubscribe(eventName, callback) {
    if (this.subscriptions[eventName]) {
      this.subscriptions[eventName] = this.subscriptions[eventName].filter(
        cb => cb !== callback
      );
    }
  }

  invokeEvent(eventName, ...args) {
    if (this.subscriptions[eventName]) {
      this.subscriptions[eventName].forEach(cb => cb(...args));
    }
  }

  getLabels() {
    return {
      tapToStart: 'Tap to start',
      loading: 'Loading...',
      error: 'Error loading game',
      controls: 'Controls',
      soundOn: 'Sound on',
      soundOff: 'Sound off',
    };
  }
}

let lib = null;
/**
 * Returns the singleton instance of the Lib class.
 * @returns {Lib} The Lib instance.
 */
export const getLib = () => {
  if (!lib) {
    lib = new Lib();
  }
  return lib;
};
