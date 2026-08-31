const SOUND_ENABLED_STORAGE_KEY = 'regemLudos.soundEnabled';

export const getStoredSoundEnabled = () => {
  try {
    const value = window.localStorage.getItem(SOUND_ENABLED_STORAGE_KEY);
    if (value === null) {
      return null;
    }
    return value === 'true';
  } catch (e) {
    console.warn('[LIB] Unable to read sound preference from localStorage.', e);
    return null;
  }
};

export const persistSoundEnabled = enabled => {
  try {
    window.localStorage.setItem(SOUND_ENABLED_STORAGE_KEY, String(enabled));
  } catch (e) {
    console.warn(
      '[LIB] Unable to persist sound preference to localStorage.',
      e
    );
  }
};