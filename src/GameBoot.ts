import { getGameRoot } from './DomFuncs';
import { LAYER_OFF } from './layers/Layer';
import { LayerManager } from './layers/LayerManager';
import { GameCompleteUiLayer } from './layers/GameCompleteUiLayer';
import { MenuUiLayer } from './layers/MenuUiLayer';
import { SimLayer } from './layers/SimLayer';
import { SimUiLayer } from './layers/SimUiLayer';
import { injectTextureCss } from './model/parts/Decoration';
import { createState, setState, startPlay } from './state/StateFuncs';
import { machine } from './tables/Current';
import {
  loadSoundFiles,
  loadZzfxSounds,
  playSound,
  setSoundBank,
  SOUND_BANK_FILE,
  SOUND_START_GAME,
} from './audio/SoundFuncs';
import { audioOf, hudOf, setActiveLook } from './machine/MachineLook';

export type BootOpts = {
  listenKeys?: boolean;
  showMobile?: boolean;
  onComplete?: () => void;
};

let menuLayer: MenuUiLayer | null = null;

export const beginPlay = () => {
  startPlay();
  playSound(SOUND_START_GAME);
  if (menuLayer) {
    menuLayer.hud.hide();
    menuLayer.layerState = LAYER_OFF;
  }
};

export const bootGame = async (opts: BootOpts = {}) => {
  const root = getGameRoot();
  if (!root) {
    console.error('Game root not found');
    return;
  }

  setActiveLook(machine);
  injectTextureCss();
  loadZzfxSounds();
  const audio = audioOf(machine);
  if (audio.bank === SOUND_BANK_FILE) {
    await loadSoundFiles();
  }
  setSoundBank(audio.bank);
  document.title = machine.name;
  setState(createState(machine));

  const listenKeys = opts.listenKeys !== false;
  const hud = hudOf(machine);
  const showMobile =
    opts.showMobile !== false && (hud.flippers || hud.launcher);
  menuLayer = new MenuUiLayer(root, listenKeys);
  new LayerManager([
    new SimLayer(),
    new SimUiLayer(root, {
      listenKeys,
      showMobile,
    }),
    menuLayer,
    new GameCompleteUiLayer(root, {
      listenKeys,
      onComplete: opts.onComplete,
    }),
  ]).start();
};
