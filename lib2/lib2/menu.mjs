import { getElementById } from './utils.mjs';

const updateSoundButtonIcon = enabled => {
  const topBar = document.getElementById('top-bar');
  if (!topBar || !topBar.children || !topBar.children[0]) {
    return;
  }
  const soundButton = topBar.children[0];
  const img = soundButton.children[0];
  if (!img) {
    return;
  }
  /** @type {HTMLImageElement} */
  (img).src = enabled
    ? // these are relative to the dist folder of the iframe, where the index is loaded
      '/lib2/assets/sound_on.svg'
    : '/lib2/assets/sound_off.svg';
};

export const setWindowMenuEvents = lib => {
  /** @type {any} */
  const localWindow = window;

  lib.subscribe('onToggleSound', updateSoundButtonIcon);
  updateSoundButtonIcon(lib.getConfig().soundEnabled);

  localWindow.onToggleSound = function () {
    lib.toggleSound();
  };

  localWindow.onToggleControls = function () {
    const gameOuter = getElementById('outer-game');
    if (!gameOuter) {
      return;
    }
    const controls = lib.getConfig().showControls;
    if (controls) {
      lib.hideControls();
      gameOuter.classList.remove('game-outer-yes-controls');
      gameOuter.classList.add('game-outer-no-controls');
    } else {
      lib.showControls();
      gameOuter.classList.remove('game-outer-no-controls');
      gameOuter.classList.add('game-outer-yes-controls');
    }
  };

  localWindow.onToggleHelp = function () {
    if (getElementById('instructions')) {
      return;
    }
    const url = `instructions/instructions.${lib.getConfig().language}.html`;
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.id = 'instructions';
    iframe.className = 'instructions';

    const closeInstructions = function (e) {
      if (e.key === 'Escape') {
        getElementById('help-holder')?.remove();
        localWindow.removeEventListener('keydown', closeInstructions);
      }
      e.stopPropagation();
    };
    localWindow.addEventListener('keydown', closeInstructions);

    const closeButton = document.createElement('button');
    closeButton.id = 'close-instructions';
    closeButton.className = 'close-instructions cancel-button';
    closeButton.innerHTML = '<img src="/lib2/assets/cancel.svg" alt="Close" />';

    const closeButtonHolder = document.createElement('div');
    closeButtonHolder.id = 'close-instructions-holder';
    closeButtonHolder.className = 'close-instructions-holder';
    closeButtonHolder.appendChild(closeButton);

    const iframeHolder = document.createElement('div');
    iframeHolder.id = 'help-holder';
    iframeHolder.className = 'help-holder';

    iframeHolder.appendChild(closeButtonHolder);
    iframeHolder.appendChild(iframe);

    closeButton.onclick = function () {
      getElementById('help-holder')?.remove();
    };

    document.body.appendChild(iframeHolder);
  };
};
