import type { MachineAudio, MachineHud, MachineTheme } from './MachineTypes';

export const DEFAULT_THEME: MachineTheme = {
  palette: ['#f66', '#fa6', '#fd6', '#6c6', '#8cf', '#a6f', '#c8f'],
  sectionBg: '#123',
  sectionDot: '#345',
  accent: '#fc8',
};

export const DEFAULT_HUD: MachineHud = {
  flippers: true,
  launcher: true,
};

export const DEFAULT_AUDIO: MachineAudio = {
  bank: 'zzfx',
};

const copyTheme = (theme?: Partial<MachineTheme>): MachineTheme => {
  const palette =
    theme && theme.palette && theme.palette.length > 0
      ? theme.palette.slice()
      : DEFAULT_THEME.palette.slice();
  return {
    palette,
    sectionBg: (theme && theme.sectionBg) || DEFAULT_THEME.sectionBg,
    sectionDot: (theme && theme.sectionDot) || DEFAULT_THEME.sectionDot,
    accent: (theme && theme.accent) || DEFAULT_THEME.accent,
  };
};

export const themeOf = (machine: { theme?: Partial<MachineTheme> }): MachineTheme => {
  return copyTheme(machine.theme);
};

export const hudOf = (machine: { hud?: Partial<MachineHud> }): MachineHud => {
  return {
    flippers: machine.hud && machine.hud.flippers != null
      ? !!machine.hud.flippers
      : DEFAULT_HUD.flippers,
    launcher: machine.hud && machine.hud.launcher != null
      ? !!machine.hud.launcher
      : DEFAULT_HUD.launcher,
  };
};

export const audioOf = (machine: { audio?: Partial<MachineAudio> }): MachineAudio => {
  const bank = machine.audio && machine.audio.bank;
  return {
    bank: bank === 'file' ? 'file' : DEFAULT_AUDIO.bank,
  };
};

let activeTheme = copyTheme(DEFAULT_THEME);
let activeHud = { ...DEFAULT_HUD };
let activeAudio = { ...DEFAULT_AUDIO };

export const setActiveLook = (machine: {
  theme?: Partial<MachineTheme>;
  hud?: Partial<MachineHud>;
  audio?: Partial<MachineAudio>;
}) => {
  activeTheme = themeOf(machine);
  activeHud = hudOf(machine);
  activeAudio = audioOf(machine);
};

export const getTheme = () => activeTheme;
export const getHud = () => activeHud;
export const getAudio = () => activeAudio;

export const palette = () => activeTheme.palette;
export const accent = () => activeTheme.accent;
export const sectionBg = () => activeTheme.sectionBg;
export const sectionDot = () => activeTheme.sectionDot;
