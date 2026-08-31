import { LibInput } from './input.mjs';

/**
 * @param {import('./lib.mjs').Lib} lib
 */
export const initEvents = lib => {
  /** @type {any} */
  const localWindow = window;
  const isArcadeCabinet = lib.getConfig().isArcadeCabinet;

  window.addEventListener(
    'keydown',
    ev => {
      if (ev.key === 'F5') {
        window.location.reload();
        ev.preventDefault();
      } else if (ev.key === 'Escape') {
        ev.preventDefault();
        ev.stopPropagation();
        if (!ev.repeat) {
          lib.notifyEscapePressed();
        }
      }
    },
    true
  );

  window.addEventListener(
    'keyup',
    ev => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        ev.stopPropagation();
        lib.notifyEscapeUnpressed();
      }
    },
    true
  );

  window.addEventListener('message', event => {
    try {
      const data = JSON.parse(event.data);
      console.log('%cgot iframe action ' + data?.action, 'color:#aaF');
      if (data.action === 'HIDE_CONTROLS') {
        console.log('[lib2] HIDE_CONTROLS noop');
        // lib.getConfig().shouldShowControls = true;
        // lib.toggleControls();
      } else if (data.action === 'SHOW_CONTROLS') {
        console.log('[lib2] SHOW_CONTROLS noop');
        // lib.getConfig().shouldShowControls = false;
        // lib.toggleControls();
      } else if (data.action === 'SEND_CONTROL_LAYOUT') {
        LibInput.setControlLayout(data);
      } else if (data.action === 'SCALE_ORIGINAL') {
        console.log('[lib2] SCALE_ORIGINAL noop');
        // lib.setScale(true);
        // const canvas = document.getElementById('canvas');
        // if (canvas && isArcadeCabinet) {
        //   canvas.style.border = 'unset';
        // }
      } else if (data.action === 'SCALE_WINDOW') {
        console.log('[lib2] SCALE_WINDOW noop');
        // lib.setScale(false);
        // const canvas = document.getElementById('canvas');
        // if (canvas && isArcadeCabinet) {
        //   canvas.style.border = '1px solid white';
        // }
      } else if (data.action === 'MUTE_AUDIO') {
        lib.getConfig().soundEnabled = true;
        lib.toggleSound();
      } else if (data.action === 'UNMUTE_AUDIO') {
        lib.getConfig().soundEnabled = false;
        lib.toggleSound();
      } else if (data.action === 'SET_VOLUME') {
        lib.setVolume(data.payload);
        lib.setWASMVolume(Math.floor(data.payload * 100));
      } else if (data.action === 'BUTTON_DOWN') {
        lib.handleButtonDown(data.payload);
      } else if (data.action === 'BUTTON_UP') {
        lib.handleButtonUp(data.payload);
      } else if (data.action === 'DISABLE_CONTROLS') {
        lib.disableModuleControls();
      } else if (data.action === 'PLAYER_JOINED') {
        console.log('[lib2] PLAYER_JOINED noop');
        // lib.playerJoined();
      } else if (data.action === 'PLAYER_LEFT') {
        console.log('[lib2] PLAYER_LEFT noop');
        // lib.playerLeft();
      } else if (data.action === 'RELOAD_GAME') {
        window.location.reload();
      } else if (data.action === 'CUSTOM_DATA') {
        if (localWindow.onCustomData) {
          localWindow.onCustomData(JSON.parse(data.payload));
        } else {
          console.error(
            'Error, cannot CUSTOM_DATA no "onCustomData" function found on window.  Payload:',
            data.payload
          );
        }
      } else if (data.action === 'BEGIN_GAME') {
        console.log('BEGIN GAME', data);
        lib.config.start(data.payload);
      }
    } catch (e) {
      console.warn('[lib2] Error on postMessage handler', e, event.data);
    }
  });

  // required for wasm to grab keyboard controls
  setInterval(() => {
    if (lib.getConfig().gameStarted) {
      window.focus();
    }
  }, 500);
};
