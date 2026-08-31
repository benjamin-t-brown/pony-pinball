export interface SoundPlayer {
  loadSound(name: string, url: string, volume?: number): Promise<unknown>;
  playSoundName(soundName: string): void;
  stopSound(soundObj: unknown): void;
  setVolume(v: number): void;
}

export interface LibConfig {
  gameStarted: boolean;
  soundEnabled: boolean;
  disableInput: boolean;
  isArcadeCabinet: boolean;
  language: string;
  targetWidth: number;
  targetHeight: number;
  showControls: boolean;
  tapToStart: boolean;
  start: (...args: unknown[]) => void;
  end: (...args: unknown[]) => void;
}

export interface ControlKeyDesc {
  key: string[];
  label: string;
}

export interface DpadLayout {
  up: string;
  down: string;
  left: string;
  right: string;
}

export interface ButtonsLayout {
  confirm: string;
  cancel: string;
  aux: string;
  skip: string;
  escape: string;
}

export interface ButtonCodes {
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
  BUTTON_ESCAPE: number;
}

export interface LibInput {
  getButtonCodes(): ButtonCodes;
  setControlLayout(layout: Record<string, unknown>): void;
  getActionKey(): ControlKeyDesc;
  isActionKey(key: string): boolean;
  getConfirmKey(): ControlKeyDesc;
  isConfirmKey(key: string): boolean;
  getCancelKey(): ControlKeyDesc;
  isCancelKey(key: string): boolean;
  getAuxKey(): ControlKeyDesc;
  isAuxKey(key: string): boolean;
  getUpKey(): ControlKeyDesc;
  isUpKey(key: string): boolean;
  getDownKey(): ControlKeyDesc;
  isDownKey(key: string): boolean;
  getLeftKey(): ControlKeyDesc;
  isLeftKey(key: string): boolean;
  getRightKey(): ControlKeyDesc;
  isRightKey(key: string): boolean;
  getSkipKey(): ControlKeyDesc;
  isSkipKey(key: string): boolean;
  getEscapeKey(): ControlKeyDesc;
  isEscapeKey(key: string): boolean;
  simulateKeyPress(buttonIndex: number, isDown: boolean): void;
  startGamepadInterval(lib: Lib): ReturnType<typeof setInterval>;
  createOnScreenControls(
    dpadLayout: DpadLayout,
    buttonsLayout: ButtonsLayout
  ): void;
}

export class Lib {
  keyboardLayout: Record<string, unknown>;
  subscriptions: Record<string, Array<(...args: unknown[]) => void>>;
  config: LibConfig;
  soundPlayer: SoundPlayer;
  canvas: HTMLCanvasElement | null;
  input: LibInput;

  setConfig(config?: Partial<LibConfig>): void;
  getConfig(): LibConfig;
  getCanvas(): HTMLCanvasElement;
  hideLoading(): void;
  showError(): void;
  showGame(): void;
  hideGame(): void;
  showControls(): void;
  hideControls(): void;
  showMenu(): void;
  hideMenu(): void;
  modulePostRunFromJs(): void;
  setupKeyboardEvents(): void;
  disableModuleControls(): void;
  enableModuleControls(): void;
  toggleSound(): void;
  setWASMVolume(pct: number): void;
  setVolume(pct: number): void;
  setControlLayout: (layout: Record<string, unknown>) => void;
  handleButtonDown(key: number, event?: Event): void;
  handleButtonUp(key: number): void;
  sendEvent(event: number, payload: unknown): void;
  notifyParentFrame(action: string, payload: unknown): void;
  notifyTargetWindowSize(w: number, h: number): void;
  notifyGameReady(): void;
  notifyGameStarted(): void;
  notifyGameCompleted(result: unknown): void;
  notifyGameGeneric(payload: unknown): void;
  notifyGameCancelled(): void;
  notifyRPGScript(scriptSrc: string): void;
  notifyGameCustom(args: unknown): void;
  notifyEscapePressed(): void;
  notifyEscapeUnpressed(): void;
  subscribe(eventName: string, callback: (...args: unknown[]) => void): void;
  unsubscribe(eventName: string, callback: (...args: unknown[]) => void): void;
  invokeEvent(eventName: string, ...args: unknown[]): void;
  getLabels(): {
    tapToStart: string;
    loading: string;
    error: string;
    controls: string;
    soundOn: string;
    soundOff: string;
  };
}

export function getLib(): Lib;
