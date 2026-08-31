import {
  playZzfx,
  SOUND_BALL_TRAVELING,
  SOUND_GAME_WIN,
  SOUND_GET_COIN,
  SOUND_HIT_FAN,
  SOUND_HIT_SMALL_CIRCLE,
  SOUND_LAUNCH,
  SOUND_LAUNCH_PULL_BACK,
  SOUND_PADDLE_FLIPPER,
  SOUND_PADDLE_FLIPPER_DOWN,
  SOUND_PORTAL_IN,
  SOUND_PORTAL_OUT,
  SOUND_SECRET,
  SOUND_START_GAME,
} from '../Zzfx.js';
import { SOUND_DIR } from '../PublicAssets';

export {
  SOUND_BALL_TRAVELING,
  SOUND_GAME_WIN,
  SOUND_GET_COIN,
  SOUND_HIT_FAN,
  SOUND_HIT_SMALL_CIRCLE,
  SOUND_LAUNCH,
  SOUND_LAUNCH_PULL_BACK,
  SOUND_PADDLE_FLIPPER,
  SOUND_PADDLE_FLIPPER_DOWN,
  SOUND_PORTAL_IN,
  SOUND_PORTAL_OUT,
  SOUND_SECRET,
  SOUND_START_GAME,
};

export type PlaySoundFn = (id: number) => void;

export const SOUND_BANK_ZZFX = 'zzfx';
export const SOUND_BANK_FILE = 'file';
export type SoundBank = typeof SOUND_BANK_ZZFX | typeof SOUND_BANK_FILE;

export const SOUND_ASSETS = [
  { id: SOUND_HIT_SMALL_CIRCLE, name: 'SOUND_HIT_SMALL_CIRCLE', file: 'hit-small-circle.mp3' },
  { id: SOUND_LAUNCH, name: 'SOUND_LAUNCH', file: 'launch.mp3' },
  { id: SOUND_LAUNCH_PULL_BACK, name: 'SOUND_LAUNCH_PULL_BACK', file: 'launch-pull-back.mp3' },
  { id: SOUND_START_GAME, name: 'SOUND_START_GAME', file: 'start-game.mp3' },
  { id: SOUND_BALL_TRAVELING, name: 'SOUND_BALL_TRAVELING', file: 'ball-traveling.mp3' },
  { id: SOUND_GET_COIN, name: 'SOUND_GET_COIN', file: 'get-coin.mp3' },
  { id: SOUND_SECRET, name: 'SOUND_SECRET', file: 'secret.mp3' },
  { id: SOUND_PADDLE_FLIPPER, name: 'SOUND_PADDLE_FLIPPER', file: 'paddle-flipper.mp3' },
  { id: SOUND_PADDLE_FLIPPER_DOWN, name: 'SOUND_PADDLE_FLIPPER_DOWN', file: 'paddle-flipper-down.mp3' },
  { id: SOUND_PORTAL_IN, name: 'SOUND_PORTAL_IN', file: 'portal-in.mp3' },
  { id: SOUND_PORTAL_OUT, name: 'SOUND_PORTAL_OUT', file: 'portal-out.mp3' },
  { id: SOUND_HIT_FAN, name: 'SOUND_HIT_FAN', file: 'hit-fan.mp3' },
  { id: SOUND_GAME_WIN, name: 'SOUND_GAME_WIN', file: 'game-win.mp3' },
] as const;

export type SoundName = (typeof SOUND_ASSETS)[number]['name'];
export type SoundRef = number | SoundName;

const SOUND_ID_BY_NAME = Object.fromEntries(
  SOUND_ASSETS.map(asset => [asset.name, asset.id])
) as Record<SoundName, number>;

const zzfxBank = new Map<number, PlaySoundFn>();
const fileBank = new Map<number, PlaySoundFn>();
const playedThisTick: Record<number, boolean> = {};

let soundEnabled = true;
let soundBank: SoundBank = SOUND_BANK_ZZFX;

export const soundId = (ref: SoundRef): number | undefined => {
  if (typeof ref === 'number') {
    return ref;
  }
  return SOUND_ID_BY_NAME[ref];
};

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = !!enabled;
};

export const setSoundBank = (bank: SoundBank) => {
  soundBank = bank;
};

const bankMap = (bank: SoundBank) => {
  return bank === SOUND_BANK_FILE ? fileBank : zzfxBank;
};

/** Register zzfx patches under the same SOUND_* ids / names. */
export const loadZzfxSounds = () => {
  for (const asset of SOUND_ASSETS) {
    zzfxBank.set(asset.id, () => playZzfx(asset.id));
  }
};

/** Register an mp3 (or other decoded file) for one SOUND_* id. Does not touch zzfx. */
export const setFileSoundPlay = (id: number, play: PlaySoundFn) => {
  fileBank.set(id, play);
};

export const clearFileSoundPlay = (id: number) => {
  fileBank.delete(id);
};

export const loadSoundFile = (id: number, url: string) => {
  return new Promise<void>((resolve, reject) => {
    const src = new Audio();
    src.preload = 'auto';
    src.addEventListener(
      'canplaythrough',
      () => {
        setFileSoundPlay(id, () => {
          const clip = src.cloneNode() as HTMLAudioElement;
          clip.play().catch(() => {});
        });
        resolve();
      },
      { once: true }
    );
    src.addEventListener(
      'error',
      () => {
        reject(new Error('Failed to load ' + url));
      },
      { once: true }
    );
    src.src = url;
  });
};

/** Load every mp3 into the file bank. Missing files reject; they do not fall back to zzfx. */
export const loadSoundFiles = async (baseUrl = SOUND_DIR) => {
  const prefix = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
  await Promise.all(
    SOUND_ASSETS.map(asset => loadSoundFile(asset.id, prefix + asset.file))
  );
};

export const playSound = (ref: SoundRef) => {
  if (!soundEnabled) {
    return;
  }
  const id = soundId(ref);
  if (id == null) {
    return;
  }
  if (playedThisTick[id]) {
    return;
  }
  playedThisTick[id] = true;
  const play = bankMap(soundBank).get(id);
  if (!play) {
    return;
  }
  play(id);
};

export const clearSoundsPlayedThisTick = () => {
  for (const id in playedThisTick) {
    delete playedThisTick[id];
  }
};
