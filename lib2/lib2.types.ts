export interface ILib2Config {
  gameStarted: boolean;
  soundEnabled: boolean;
  disableInput: boolean;
  isArcadeCabinet: boolean;
  language: string;
  targetWidth: number;
  targetHeight: number;
  showControls: boolean;
  tapToStart: boolean | string;
  start: () => void;
  end: () => void;
  autoPushStart?: boolean;
  shouldStartMuted?: boolean;
  initialSoundEnabled?: boolean;
}

export type Lib2EventEnum =
  | 'onButtonDown'
  | 'onButtonUp'
  | 'onToggleModuleControls'
  | 'onToggleSound'
  | 'onSetVolume';

export interface IButtonCodes {
  BUTTON_LEFT: number;
  BUTTON_RIGHT: number;
  BUTTON_UP: number;
  BUTTON_DOWN: number;
  BUTTON_SHIFT: number;
  BUTTON_CTRL: number;
  BUTTON_ENTER: number;
  BUTTON_SPACE: number;
  BUTTON_X: number;
  BUTTON_Z: number;
  BUTTON_C: number;
}

export type Lib2DpadLayout = 'normal' | 'lr' | 'centeredlaf';
export type Lib2ButtonsLayout = 'a' | 'ab' | 'abshift';

export interface ILib2StartArgs {
  init: () => void | Promise<void>;
  start: () => void;
  end: () => void;
  controls: {
    dpadLayout: Lib2DpadLayout;
    buttonsLayout: Lib2ButtonsLayout;
  };
}

/** Arguments passed to `CtxAudio#play` in `lib2/sound.mjs`. */
export interface ICtxAudioPlayArgs {
  volume: number;
  loop: boolean;
  startTime: number;
  duration: number;
}

/**
 * Web Audio playback handle from `lib2/sound.mjs` (`CtxAudio` class).
 * Not exported from the module; exposed via `SoundPlayer` and `getSound` results.
 */
export interface ICtxAudio {
  audioBuffer: AudioBuffer;
  source: AudioBufferSourceNode;
  audioCtx: AudioContext;
  gainNode: GainNode;
  startTime: number;
  paused: boolean;

  copy(): ICtxAudio;
  copyWithCtx(audioCtx: AudioContext): ICtxAudio;
  play(args: ICtxAudioPlayArgs): void;
  stop(): void;
  pause(): void;
  unpause(): void;
  isPaused(): boolean;
  setVolume(volume: number): void;
  getVolume(): number;
  getDuration(): number;
  getCurrentTime(): number;
}

/** Entry stored in `SoundPlayer#sounds` after `loadSound`. */
export interface ILib2LoadedSoundEntry {
  sound: ICtxAudio;
  audio: ICtxAudio;
  soundDuration: number;
  volume?: number;
}

/** Object returned by `SoundPlayer#getSound` (playable snapshot). */
export interface ILib2PlayableSound extends ILib2LoadedSoundEntry {
  duration: number;
  soundName: string;
  lastStartTimestamp: number;
  isPlaying: boolean;
  isPaused: boolean;
}

/** `SoundPlayer` from `lib2/sound.mjs`. */
export interface ISoundPlayer {
  audioCtx: AudioContext;
  sounds: Record<string, ILib2LoadedSoundEntry>;

  loadSound(
    name: string,
    url: string,
    volume?: number
  ): Promise<ICtxAudio>;
  getSound(soundName: string): ILib2PlayableSound | null;
  playSound(soundObj: ILib2PlayableSound): void;
  playSoundName(soundName: string): void;
  stopSound(soundObj: ILib2PlayableSound): void;
  setVolume(v: number): void;
}

export interface ILib2 {
  keyboardLayout: Record<string, unknown>;
  subscriptions: Record<Lib2EventEnum, Array<(...args: any[]) => void>>;
  config: ILib2Config;
  soundPlayer: ISoundPlayer;

  setConfig: (config?: Partial<ILib2Config>) => void;
  getConfig: () => ILib2Config;
  getCanvas: () => HTMLCanvasElement;
  hideLoading: () => void;
  showError: () => void;
  showGame: () => void;
  hideGame: () => void;
  showControls: () => void;
  hideControls: () => void;
  showMenu: () => void;
  hideMenu: () => void;
  disableModuleControls: () => void;
  enableModuleControls: () => void;
  toggleSound: () => void;
  setWASMVolume: (pct: number) => void;
  setVolume: (pct: number) => void;
  setControlLayout: (layout: Record<string, unknown>) => void;
  handleButtonDown: (key: number | string) => void;
  handleButtonUp: (key: number | string) => void;
  sendEvent: (event: number | string, payload: unknown) => void;

  notifyParentFrame: (action: string, payload: unknown) => void;
  notifyTargetWindowSize: (w: number, h: number) => void;
  notifyGameReady: () => void;
  notifyGameStarted: () => void;
  notifyGameCompleted: (result: string | number | object) => void;
  notifyGameGeneric: (payload: unknown) => void;
  notifyGameCancelled: () => void;
  notifyRPGScript: (scriptSrc: string) => void;
  notifyGameCustom: (args: unknown) => void;
  notifyEscapePressed: () => void;
  notifyEscapeUnpressed: () => void;

  subscribe: (
    eventName: Lib2EventEnum,
    callback: (...args: any[]) => void
  ) => void;
  unsubscribe: (
    eventName: Lib2EventEnum,
    callback: (...args: any[]) => void
  ) => void;
  invokeEvent: (eventName: Lib2EventEnum, ...args: any[]) => void;

  getLabels: () => {
    tapToStart: string;
    loading: string;
    error: string;
    controls: string;
    soundOn: string;
    soundOff: string;
  };
}
