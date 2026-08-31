import { startLib2, LibInput } from '../lib2/lib2.mjs';
import { beginPlay, bootGame } from './GameBoot';
import { getState } from './state/StateFuncs';
import {
  CONTROL_LEFT,
  CONTROL_RIGHT,
  CONTROL_START,
} from './model/Part';
import { setSoundEnabled } from './audio/SoundFuncs';
import { getHud, hudOf } from './machine/MachineLook';
import { machine } from './tables/Current';

const applyButton = (key: number, down: boolean) => {
  const state = getState();
  if (!state || !state.playing) {
    return;
  }
  const hud = getHud();
  const buttons = LibInput.getButtonCodes();
  if (hud.flippers && key === buttons.BUTTON_LEFT) {
    state.input[CONTROL_LEFT] = down;
  } else if (hud.flippers && key === buttons.BUTTON_RIGHT) {
    state.input[CONTROL_RIGHT] = down;
  } else if (
    hud.launcher &&
    (key === buttons.BUTTON_SPACE ||
      key === buttons.BUTTON_X ||
      key === buttons.BUTTON_ENTER)
  ) {
    state.input[CONTROL_START] = down;
  }
};

const main = () => {
  const hud = hudOf(machine);
  const lib = startLib2({
    controls: {
      dpadLayout: hud.flippers ? 'lr' : 'none',
      buttonsLayout: hud.launcher ? 'a' : 'a',
    },
    async init() {
      const arcade = lib.getConfig().isArcadeCabinet;
      if (lib.getConfig().initialSoundEnabled != null) {
        lib.config.soundEnabled = !!lib.getConfig().initialSoundEnabled;
      }
      setSoundEnabled(lib.getConfig().soundEnabled);
      lib.subscribe('onToggleSound', enabled => {
        setSoundEnabled(enabled);
      });
      lib.subscribe('onButtonDown', key => {
        applyButton(key, true);
      });
      lib.subscribe('onButtonUp', key => {
        applyButton(key, false);
      });
      lib.modulePostRunFromJs();
      await bootGame({
        listenKeys: !arcade,
        showMobile: false,
        onComplete: () => {
          const state = getState();
          lib.notifyGameCompleted({
            score: state.lastMs,
            time: state.lastMs,
          });
        },
      });
      lib.setupKeyboardEvents();
      lib.notifyGameReady();
    },
    start() {
      lib.config.disableInput = false;
      beginPlay();
      lib.notifyGameStarted();
    },
    end() {
      lib.config.disableInput = true;
    },
  });
};

main();
