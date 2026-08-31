import './utils.mjs';
import { setupEmscriptenModule } from './emscripten.mjs';
import { LibInput } from './input.mjs';
import { getLib } from './lib.mjs';
import { setWindowMenuEvents } from './menu.mjs';
import { getStoredSoundEnabled } from './storage.mjs';
import { enableConsole, getElementById } from './utils.mjs';
import { initEvents } from './events.mjs';

let loadTimeout = null;
const LOAD_TIMEOUT_MS = 60000;

const preMain = (start, end) => {
  /** @type {any} */
  const localWindow = window;
  const params = new URLSearchParams(window.location.search);
  const language = params.get('language') || 'en';
  const isArcadeCabinet =
    params.get('arcade') === 'true' || params.get('cabinet') === 'true';
  const shouldMute = params.get('muted') === 'true';
  const tapToStart = params.get('tap');
  const storedSoundEnabled = getStoredSoundEnabled();
  const shouldStartMuted = storedSoundEnabled === false || shouldMute;
  const initialSoundEnabled = !shouldStartMuted;
  const Lib = getLib();
  Lib.setConfig({
    language,
    isArcadeCabinet,
    shouldStartMuted,
    initialSoundEnabled,
    tapToStart,
    start,
    end,
  });
  localWindow.Lib = Lib;

  LibInput.startGamepadInterval(Lib);
  setWindowMenuEvents(Lib);
  initEvents(Lib);

  /** @type {number} */
  loadTimeout = /** @type {any} */ (
    setTimeout(function () {
      console.error('[lib2] content took too long to load.');
      Lib.showError();
    }, LOAD_TIMEOUT_MS)
  );

  setupEmscriptenModule(Lib, { loadTimeout: loadTimeout });
};

export const main = (
  args = {
    init: () => {},
    start: () => {},
    end: () => {},
  }
) => {
  enableConsole();

  const { init, start, end } = args;
  const _verify = () => {
    if (!init) {
      throw new Error('init is required');
    }
    if (!start) {
      throw new Error('start is required');
    }
    if (!end) {
      throw new Error('end is required');
    }
  };

  try {
    _verify();
  } catch (e) {
    console.error(e);
    clearTimeout(loadTimeout);
    return;
  }

  /** @type {any} */
  const localWindow = window;

  const _setupTapToStart = () => {
    const div = document.createElement('div');
    const loadingElem = getElementById('loading');
    if (loadingElem) {
      loadingElem.style.display = 'none';
    }
    localWindow.onTapToStart = function () {
      window.removeEventListener('mousedown', localWindow.onTapToStart);
      window.removeEventListener('touchstart', localWindow.onTapToStart);
      if (loadingElem) {
        loadingElem.style.display = 'flex';
      }
      div.style.display = 'none';
      _initGameAfterLibIsReady();
    };
    div.innerHTML = getLib().getLabels().tapToStart;
    div.className = 'tap-to-start';
    document.body.appendChild(div);
    localWindow.addEventListener('mousedown', localWindow.onTapToStart);
    localWindow.addEventListener('touchstart', localWindow.onTapToStart);
  };

  const _initGameAfterLibIsReady = async () => {
    LibInput.createOnScreenControls(
      args.controls.dpadLayout,
      args.controls.buttonsLayout
    );
    try {
      // game should have declared "init" on window, which should declare
      // what controls are required to start the game
      console.log(
        '[lib2] Calling init',
        'isCabinet:',
        getLib().getConfig().isArcadeCabinet
      );
      await args.init();
      if (getLib().getConfig().isArcadeCabinet) {
        getLib().hideMenu();
        getLib().hideControls();
      } else {
        getLib().showMenu();
        getLib().showControls();
      }
    } catch (e) {
      console.error(
        'Error calling window.init function, is it defined for this program?'
      );
      throw e;
    }
  };

  preMain(start, end);
  window.addEventListener('load', async () => {
    if (getLib().getConfig().tapToStart === true) {
      _setupTapToStart();
    } else {
      _initGameAfterLibIsReady();
    }
  });
};
